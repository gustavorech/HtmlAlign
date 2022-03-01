/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Dimension.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export type HTMLElementLayout = HTMLElement & { component: Component };
  export class Component implements ITwoDimensionalSet<Dimension> {
    // variáveis para auxiliar na identificação do componente
    get isLayoutComponent(): boolean {
      return this.#behavior.name !== 'in' && this.#behavior.name !== 'logical';
    }
    get isBehaviorComponent(): boolean {
      return (
        this.#behavior.name !== 'in' &&
        this.#behavior.name !== 'body' &&
        this.#behavior.name !== 'logical'
      );
    }

    constructor(
      public readonly parent: Component,
      public readonly element?: HTMLElementLayout
    ) {
      // componente lógico
      if (!this.element) {
        this.behavior = new LogicalBehavior();
        this.#behavior.component = this;
        return;
      }

      this.element.component = this;

      // realiza a primeira leitura das propriedades css
      Layout.refreshValuesFromCssProperties(this);

      this.processChangeChildren();
    }

    public children: Component[] = [];
    public horizontal = new Dimension(Axis.horizontal);
    public vertical = new Dimension(Axis.vertical);
    public parentAttached: any = {};

    public getOnAxis(axis: Axis): Dimension {
      return axis === Axis.horizontal ? this.horizontal : this.vertical;
    }
    public getPerpendicularToAxis(axis: Axis): Dimension {
      return axis === Axis.horizontal ? this.vertical : this.horizontal;
    }
    public setOnAxis(axis: Axis, value: Dimension): void {
      if (axis == Axis.horizontal) {
        this.horizontal = value;
      } else {
        this.vertical = value;
      }
    }
    public setPerpendicularToAxis(axis: Axis, value: Dimension): void {
      if (axis == Axis.vertical) {
        this.horizontal = value;
      } else {
        this.vertical = value;
      }
    }

    #behavior: IBehavior;
    #isBehaviorChanged = false;
    public get behavior() {
      return this.#behavior;
    }
    public set behavior(value: IBehavior | undefined) {
      // [TODO] temporário, precisa melhorar
      if (!value) {
        if (!this.#behavior) {
          value = new InBehavior();
        } else {
          return;
        }
      }

      if (this.#behavior && this.#behavior.name != value.name) {
        this.#isBehaviorChanged = true;

        // [TODO] [FIT] temporário, precisa melhorar
        if (this.#behavior.name == 'fit') {
          this.element.style.removeProperty('transform');
        }
      }

      if (!this.#behavior || this.#isBehaviorChanged) {
        this.#behavior = value;
      }

      this.horizontal.isParentAPanel = this.vertical.isParentAPanel =
        this.parent.behavior.name == 'panel' ||
        this.parent.behavior.name == 'fit';
    }

    public get isVisible(): boolean {
      return this.horizontal.isVisible;
    }
    public set isVisible(value: boolean) {
      this.horizontal.isVisible = value;
      this.vertical.isVisible = value;
    }

    public get horizontalScroll() {
      return this.horizontal.scroll;
    }
    public set horizontalScroll(value: Scroll) {
      this.horizontal.scroll = value;
    }
    public get verticalScroll() {
      return this.vertical.scroll;
    }
    public set verticalScroll(value: Scroll) {
      this.vertical.scroll = value;
    }

    #isFrozen = false;
    public frozen(): void {
      this.#isFrozen = true;
    }
    public unfrozen(): void {
      this.#isFrozen = false;

      this.notifyCssPropertiesChanged();
      refreshLayout();
    }

    public notifyCssPropertyChanged(cssProperty: ICssProperty) {
      this.element.style.setProperty(
        cssProperty.name,
        cssProperty.getValueStringFromComponent(this)
      );

      this.notifyNeedMeasure();
    }

    public setCssPropertyValue(cssProperty: ICssProperty) {
      this.element.style.setProperty(
        cssProperty.name,
        cssProperty.getValueStringFromComponent(this)
      );
    }

    #childrenChanged = false;
    #cssPropertiesChanged = false;
    #needArrange = false;
    #childNeedArrange = false;
    #needMeasure = true;
    #needLayout = false;
    #childNeedLayout = false;

    public notifyChildrenChanged() {
      if (this.isLayoutComponent) {
        this.#childrenChanged = true;

        this.notifyNeedMeasure();
      } else {
        this.notifyCssPropertiesChanged();
      }
    }
    public notifyCssPropertiesChanged() {
      this.#cssPropertiesChanged = true;

      this.notifyNeedMeasure();
    }
    public notifyNeedMeasure() {
      if (!this.#needMeasure) {
        this.#needMeasure = true;

        this.parent.notifyNeedMeasure();
      }
    }
    public notifyNeedArrange() {
      this.#needArrange = true;

      this.parent.notifyChildNeedArrange();
    }
    public notifyNeedArrangeWithParent() {
      this.notifyNeedArrange();
      this.parent.notifyNeedArrange();
    }
    public notifyChildNeedArrange() {
      if (!this.#childNeedArrange) {
        this.#childNeedArrange = true;

        this.parent.notifyChildNeedArrange();
      }
    }
    public notifyNeedLayout() {
      this.#needLayout = true;

      this.parent.notifyChildNeedLayout();
    }
    public notifyChildNeedLayout() {
      if (!this.#childNeedLayout) {
        this.#childNeedLayout = true;

        this.parent.notifyChildNeedLayout();
      }
    }

    public processChangeChildren() {
      this.#childrenChanged = false;

      if (!this.isLayoutComponent) {
        return;
      }

      const hasNoChildren = !this.element.firstElementChild;
      if (hasNoChildren) {
        this.children = [];
        this.notifyNeedArrangeWithParent();
        return;
      }

      if (this.children.length === 0) {
        let currentChildElement = <HTMLElementLayout>(
          this.element.firstElementChild
        );
        while (currentChildElement) {
          if (Layout.isBehavior(currentChildElement)) {
            this.children.push(new Component(this, currentChildElement));
          }

          currentChildElement = <HTMLElementLayout>(
            currentChildElement.nextElementSibling
          );
        }
        this.notifyNeedArrangeWithParent();
        return;
      }

      let currentChildElement = <HTMLElementLayout>(
        this.element.firstElementChild
      );

      let currentChildPosition = 0;
      let currentChildComponent = this.children[currentChildPosition];

      // itera sobre todos os elementos irmãos
      while (currentChildElement) {
        if (!Layout.isBehavior(currentChildElement)) {
          currentChildElement = <HTMLElementLayout>(
            currentChildElement.nextElementSibling
          );
          continue;
        }

        if (currentChildPosition === this.children.length) {
          this.children.push(new Component(this, currentChildElement));
          currentChildPosition++;
          currentChildElement = <HTMLElementLayout>(
            currentChildElement.nextElementSibling
          );
          continue;
        }

        const componentAlreadyAssociatedWithElement =
          currentChildElement.component;
        if (!componentAlreadyAssociatedWithElement) {
          this.children.splice(
            currentChildPosition,
            0,
            new Component(this, currentChildElement)
          );
          currentChildPosition++;
          currentChildElement = <HTMLElementLayout>(
            currentChildElement.nextElementSibling
          );
          continue;
        }

        while (
          componentAlreadyAssociatedWithElement != currentChildComponent &&
          currentChildPosition < this.children.length
        ) {
          // [TODO] [FIT] temporário, precisa melhorar
          if (componentAlreadyAssociatedWithElement.#behavior.name == 'fit') {
            this.element.style.removeProperty('transform');
          }

          this.children.splice(currentChildPosition, 1);
          currentChildComponent = this.children[currentChildPosition];
        }

        if (currentChildPosition < this.children.length) {
          currentChildPosition++;
          currentChildComponent = this.children[currentChildPosition];
        }

        currentChildElement = <HTMLElementLayout>(
          currentChildElement.nextElementSibling
        );
      }

      this.notifyNeedArrangeWithParent();
    }

    public processCssPropertiesChanged() {
      this.#cssPropertiesChanged = false;
      Layout.refreshValuesFromCssProperties(this);

      this.notifyNeedArrangeWithParent();

      // se o behavior modificou durante a leitura será necessário
      // ler novamente as propriedades e notificar os filhos para fazer o mesmo
      if (this.#isBehaviorChanged) {
        this.#isBehaviorChanged = false;

        Layout.refreshValuesFromCssProperties(this);
        for (let index = 0; index < this.children.length; index++) {
          this.children[index].notifyCssPropertiesChanged();
        }
      }
    }

    public measure(horizontal: SizeDelimiter, vertical: SizeDelimiter) {
      // componentes congelados não sofrem alterações
      if (this.#isFrozen || !this.isVisible) {
        return;
      }

      if (this.#childrenChanged) {
        this.processChangeChildren();
      }

      if (this.#cssPropertiesChanged) {
        this.processCssPropertiesChanged();
      }

      this.horizontal.givedDelimiter = horizontal;
      this.vertical.givedDelimiter = vertical;

      // se o elemento não precisa ser medido não precisa fazer nada
      if (
        !this.#needMeasure &&
        !this.horizontal.isComponentDelimiterChanged &&
        !this.vertical.isComponentDelimiterChanged
      ) {
        return;
      }

      this.#behavior.measure();

      // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
      // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
      // ao componente pai ele precisará ser rearranjado
      if (
        this._canInformNeedArrangeInMeasure &&
        (this.horizontal.needArrange || this.vertical.needArrange)
      ) {
        this.notifyNeedArrangeWithParent();
      }

      this.#needMeasure = false;
      Log.Measures++;
    }

    public _canInformNeedArrangeInMeasure = true;
    #horizontalSizeDelimiter = new SizeDelimiter(0, 0);
    #verticalSizeDelimiter = new SizeDelimiter(0, 0);
    public arrange() {
      // componentes congelados não sofrem alterações
      if (this.#isFrozen) {
        return;
      }

      // não há porque atualizar componentes sem visibilidade e que não afetam o layout
      // componentes congelados não sofrem alterações
      if (!this.isVisible || this.#isFrozen) {
        return;
      }

      if (
        this.#needArrange ||
        this.horizontal.isComponentSpaceChanged ||
        this.vertical.isComponentSpaceChanged ||
        this.horizontal.isNeedMeasureAgain ||
        this.vertical.isNeedMeasureAgain
      ) {
        if (
          this.isBehaviorComponent &&
          (this.horizontal.isNeedMeasureAgain ||
            this.vertical.isNeedMeasureAgain)
        ) {
          this._canInformNeedArrangeInMeasure = false;
          this.horizontal.isNeedMeasureAgain = false;
          this.vertical.isNeedMeasureAgain = false;

          this.#horizontalSizeDelimiter.min =
            this.#horizontalSizeDelimiter.max = this.horizontal.givedSpace.size;
          this.#verticalSizeDelimiter.min = this.#verticalSizeDelimiter.max =
            this.vertical.givedSpace.size;

          this.horizontal.givedDelimiter = this.#horizontalSizeDelimiter;
          this.vertical.givedDelimiter = this.#verticalSizeDelimiter;

          // verifica se precisa de uma nova medida
          if (
            this.horizontal.isComponentDelimiterChanged ||
            this.vertical.isComponentDelimiterChanged
          ) {
            this.#behavior.measure();
          }

          this._canInformNeedArrangeInMeasure = true;
          Log.BehaviorMeasureAgain++;
        }

        this.#behavior.arrange();

        Log.BehaviorArranges++;
      } else if (this.#childNeedArrange) {
        // [TODO] [FIT] temporário, precisa melhorar
        if (this.#behavior.name == 'fit') {
          this.#behavior.arrange();
        } else {
          for (let index = 0; index < this.children.length; index++) {
            this.children[index].arrange();
          }
        }
      }

      this.#needArrange = false;
      this.#childNeedArrange = false;

      if (
        !this.#behavior.isLayoutOverridedInArrange &&
        (this.horizontal.needLayout || this.vertical.needLayout)
      ) {
        this.#needLayout = true;
        this.parent.notifyChildNeedLayout();
      }
    }

    public processLayout() {
      if (this.#needLayout) {
        this.horizontal.refreshLayout(this);
        this.vertical.refreshLayout(this);

        this.element['laststyle'] = this.element.getAttribute('style');

        this.#needLayout = false;
      }

      if (this.#childNeedLayout) {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].processLayout();
        }
        this.#childNeedLayout = false;
      }
    }
  }
}

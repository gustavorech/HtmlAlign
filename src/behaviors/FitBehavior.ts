/* eslint-disable @typescript-eslint/triple-slash-reference */
// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class FitCssProperty implements ICssProperty {
    private regExpString = /^\s*(\w*).*$/;

    public name = '--fit';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'uniform';
    }

    public setValueFromCssProperty(_valueString: string, component: Component) {
      const valueString = this.regExpString.exec(_valueString)[1];

      const fitBehavior = <FitBehavior>component.behavior;

      if (valueString == 'fit') fitBehavior.Fit = Fit.fit;
      else if (valueString == 'horizontal') fitBehavior.Fit = Fit.horizontal;
      else if (valueString == 'vertical') fitBehavior.Fit = Fit.vertical;
      else fitBehavior.Fit = Fit.uniform;
    }

    public getValueStringFromComponent(component: Component): string {
      const fitBehavior = <FitBehavior>component.behavior;

      if (fitBehavior.Fit == Fit.fit) return 'fit';
      else if (fitBehavior.Fit == Fit.horizontal) return 'horizontal';
      else if (fitBehavior.Fit == Fit.vertical) return 'vertical';
      else return 'uniform';
    }
  }

  export class FitBehavior extends PanelBehavior implements IBehavior {
    public name = 'fit';
    public isLayoutOverridedInArrange = true;

    static FitCssProperty: FitCssProperty = new FitCssProperty();

    public getNew(): FitBehavior {
      return new FitBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [FitBehavior.FitCssProperty];
    }

    public Fit: Fit;

    public measure(): void {
      const value = this.component.element.style.getPropertyValue('transform');
      this.OnDispose();

      super.measure();

      this.component.element.style.setProperty('transform', value);

      // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
      this.component.element['laststyle'] =
        this.component.element.getAttribute('style');
    }

    public arrange(): void {
      super.arrange();

      // se o espaço determinado para o componente foi modificado ele precisará
      // atualizar o layout
      let width = this.component.horizontal.componentSpace.size;
      let height = this.component.vertical.componentSpace.size;

      if (width < 0) {
        width = 0;
      }

      if (height < 0) {
        height = 0;
      }

      this.component.element.style.width = width + 'px';
      this.component.element.style.left =
        this.component.horizontal.componentSpace.displacement + 'px';
      this.component.element.style.height = height + 'px';
      this.component.element.style.top =
        this.component.vertical.componentSpace.displacement + 'px';

      let uniformWidth =
        this.component.parent.horizontal.contentSpace.size /
        this.component.horizontal.componentDesired;

      let uniformHeight =
        this.component.parent.vertical.contentSpace.size /
        this.component.vertical.componentDesired;

      let transformOriginH = 0;
      let transformOriginV = 0;

      if (this.component.horizontal.align == Align.center) {
        transformOriginH = this.component.horizontal.componentRequired / 2;
      } else if (this.component.horizontal.align == Align.end) {
        transformOriginH = this.component.horizontal.componentRequired;
      } else if (this.component.horizontal.align == Align.streach) {
        uniformWidth = 1;
      }

      if (this.component.vertical.align == Align.center) {
        transformOriginV = this.component.vertical.componentRequired / 2;
      } else if (this.component.vertical.align == Align.end) {
        transformOriginV = this.component.vertical.componentRequired;
      } else if (this.component.vertical.align == Align.streach) {
        uniformHeight = 1;
      }

      this.component.element.style.transformOrigin =
        transformOriginH + 'px ' + transformOriginV + 'px';

      if (this.Fit == Fit.uniform) {
        this.component.element.style.transform =
          'scale(' + Math.min(uniformWidth, uniformHeight) + ')';
      } else if (this.Fit == Fit.fit) {
        this.component.element.style.transform =
          'scale(' + uniformWidth + ',' + uniformHeight + ')';
      } else if (this.Fit == Fit.horizontal) {
        this.component.element.style.transform = 'scale(' + uniformWidth + ')';
      } else if (this.Fit == Fit.vertical) {
        this.component.element.style.transform = 'scale(' + uniformHeight + ')';
      }

      // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
      this.component.element['laststyle'] =
        this.component.element.getAttribute('style');
    }

    public OnDispose(): void {
      this.component.element.style.removeProperty('transform');

      // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
      this.component.element['laststyle'] =
        this.component.element.getAttribute('style');
    }
  }
}

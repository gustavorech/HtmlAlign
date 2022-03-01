/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class InBehavior implements IBehavior {
    public name = 'in';
    public component: Component;
    public isLayoutOverridedInArrange = true;

    private _widthIsMaxContent = false;
    private _heightIsMaxContent = false;
    private _needInformLastStyle = false;

    public getNew() {
      return new InBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [];
    }

    public measure(): void {
      // se o tamanho for fixo não há motivo para perguntar para o conteúdo
      // qual o tamanho que ele deseja para si
      if (
        this.component.horizontal.isFixed &&
        this.component.vertical.isFixed
      ) {
        this._widthIsMaxContent = false;
        this._heightIsMaxContent = false;
        this.component.horizontal.contentDesired = 0;
        this.component.vertical.contentDesired = 0;
      } else {
        // se modificar as propriedades abaixo na primeria medida o tempo é muito alto
        if (!this._widthIsMaxContent) {
          this._widthIsMaxContent = true;
          this.component.element.style.removeProperty('width');

          this._needInformLastStyle = true;
        }

        if (!this._heightIsMaxContent) {
          this._heightIsMaxContent = true;
          this.component.element.style.removeProperty('height');

          this._needInformLastStyle = true;
        }

        const maxHorizontal =
          this.component.horizontal.givedDelimiter.max -
          this.component.horizontal.margin.sum();

        // maior ou igual porque o clientWidth só informa a parte inteira do número
        if (this.component.element.clientWidth >= maxHorizontal) {
          this.component.element.style.setProperty(
            'width',
            maxHorizontal + 'px'
          );
          this._widthIsMaxContent = false;

          if (!this._heightIsMaxContent) {
            this._heightIsMaxContent = true;
            this.component.element.style.removeProperty('height');
          }

          this._needInformLastStyle = true;
        }

        if (this._needInformLastStyle) {
          this._needInformLastStyle = false;

          // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
          this.component.element['laststyle'] =
            this.component.element.getAttribute('style');
        }

        const rect = this.component.element.getBoundingClientRect();

        this.component.horizontal.contentDesired =
          rect.width -
          this.component.horizontal.border.sum() -
          this.component.horizontal.padding.sum();

        this.component.vertical.contentDesired =
          rect.height -
          this.component.vertical.border.sum() -
          this.component.vertical.padding.sum();

        //this.Component.H.ActualSize = rect.width;
        //this.Component.V.ActualSize = rect.height;
      }
    }

    public arrange(): void {
      if (
        this.component.horizontal.componentDesired !=
        this.component.horizontal.givedSpace.size
      ) {
        this.component.horizontal.givedDelimiter = new SizeDelimiter(
          this.component.horizontal.givedSpace.size,
          this.component.horizontal.givedSpace.size
        );
        this.component.vertical.givedDelimiter = new SizeDelimiter(
          this.component.vertical.givedSpace.size,
          this.component.vertical.givedSpace.size
        );

        this.measure();

        if (
          this.component.horizontal.componentDesired !=
          this.component.horizontal.givedSpace.size
        ) {
          this._widthIsMaxContent = false;
        } else {
          this.component.horizontal.actualSize =
            this.component.horizontal.componentSpace.size;
        }
      }

      if (
        this.component.vertical.componentDesired !=
        this.component.vertical.givedSpace.size
      ) {
        this._heightIsMaxContent = false;
      } else {
        this.component.vertical.actualSize =
          this.component.vertical.componentSpace.size;
      }

      if (
        this.component.horizontal.needLayout ||
        this.component.vertical.needLayout
      ) {
        this.component.notifyNeedLayout();
      }
    }
  }
}

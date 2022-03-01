/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class LogicalBehavior extends PanelBehavior implements IBehavior {
    public name = 'logical';
    public isLayoutOverridedInArrange = true;

    // para o arrange repassa integralmente o que o componente pai lhe passou
    public arrange(): void {
      if (
        this.component.horizontal.isNeedMeasureAgain ||
        this.component.vertical.isNeedMeasureAgain
      ) {
        this.component._canInformNeedArrangeInMeasure = false;
        this.component.horizontal.isNeedMeasureAgain = false;
        this.component.vertical.isNeedMeasureAgain = false;

        // nos componentes lógicos apenas o tamanho da dimensão estrela pode ser modificado
        let horizontalSize;
        let verticalSize;

        if (this.component.horizontal.star > 0) {
          horizontalSize = new SizeDelimiter(
            this.component.horizontal.givedSpace.size,
            this.component.horizontal.givedSpace.size
          );
        } else {
          horizontalSize = this.component.horizontal.givedDelimiter;
        }

        if (this.component.vertical.star > 0) {
          verticalSize = new SizeDelimiter(
            this.component.vertical.givedSpace.size,
            this.component.vertical.givedSpace.size
          );
        } else {
          verticalSize = this.component.vertical.givedDelimiter;
        }

        this.component.measure(horizontalSize, verticalSize);

        Log.LogicalMeasureAgain++;
      }

      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];
        child.horizontal.givedSpace = this.component.horizontal.givedSpace;
        child.vertical.givedSpace = this.component.vertical.givedSpace;

        child.arrange();
      }
    }
  }
}

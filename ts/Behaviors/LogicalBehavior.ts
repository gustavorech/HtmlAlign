

/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class LogicalBehavior extends PanelBehavior implements IBehavior {
        public IsLayoutOverridedInArrange = true;

        // para o arrange repassa integralmente o que o componente pai lhe passou
        public Arrange(): void {

            if (this.Component.H.IsNeedMeasureAgain || this.Component.V.IsNeedMeasureAgain) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.IsNeedMeasureAgain = false;
                this.Component.V.IsNeedMeasureAgain = false;

                // nos componentes lógicos apenas o tamanho da dimensão estrela pode ser modificado
                var horizontalSize;
                var verticalSize;

                if (this.Component.H.Star > 0) {
                    horizontalSize = new SizeDelimiter(this.Component.H.GivedSpace.Size, this.Component.H.GivedSpace.Size);
                }
                else {
                    horizontalSize = this.Component.H.GivedDelimiter;
                }

                if (this.Component.V.Star > 0) {
                    verticalSize = new SizeDelimiter(this.Component.V.GivedSpace.Size, this.Component.V.GivedSpace.Size);
                }
                else {
                    verticalSize = this.Component.V.GivedDelimiter;
                }

                this.Component.Measure(horizontalSize, verticalSize);

                Log.LogicalMeasureAgain++;
            }

            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.H.GivedSpace = this.Component.H.GivedSpace;
                child.V.GivedSpace = this.Component.V.GivedSpace;

                child.Arrange();
            }
        }
    }
}

/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class BodyBehavior extends PanelBehavior implements IBehavior {
        public IsLayoutOverridedInArrange = false;

        // a medição desse comportamento é diferente, se forem componentes com máximos
        // percentuais respeita o tamanho da tela
        // se não permite que o componente cresça indefinidamente
        public Measure(): void {
            var fixedHDelimiter = new SizeDelimiter(this.Component.H.Size.Min, this.Component.H.Size.Min);
            var fixedVDelimiter = new SizeDelimiter(this.Component.V.Size.Min, this.Component.V.Size.Min);

            var maxHorizontalContentSize = 0;
            var maxVerticalContentSize = 0;
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];

                if (child.H.Size.MaxIsPercent && child.V.Size.MaxIsPercent) {
                    child.Measure(fixedHDelimiter, fixedVDelimiter);
                }
                else if (child.H.Size.MaxIsPercent || child.H.Size.Delimiter > 0) {
                    child.Measure(fixedHDelimiter, this.Component.V.ContentDelimiter);
                }
                else if (child.V.Size.MaxIsPercent) {
                    child.Measure(this.Component.H.ContentDelimiter, fixedVDelimiter);
                }
                else {
                    child.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);
                }

                if (maxHorizontalContentSize < child.H.ComponentRequired) {
                    maxHorizontalContentSize = child.H.ComponentRequired;
                }

                if (maxVerticalContentSize < child.V.ComponentRequired) {
                    maxVerticalContentSize = child.V.ComponentRequired;
                }
            }

            this.Component.H.ContentDesired = maxHorizontalContentSize;
            this.Component.V.ContentDesired = maxVerticalContentSize;
        }

        public Arrange(): void {
            var needScrollVertical = false;
            var needScrollHorizontal = false;

            if (this.Component.V.Scroll == Scroll.Auto) {
                var sizeVDesired = this.Component.V.ContentDesired + this.Component.V.Margin.Sum()
                    + this.Component.V.Border.Sum() + this.Component.V.Padding.Sum();

                if (sizeVDesired > this.Component.V.Size.Min) {
                    needScrollVertical = true;
                }
            }
            if (this.Component.H.Scroll == Scroll.Auto) {
                var sizeHDesired = this.Component.H.ContentDesired + this.Component.H.Margin.Sum()
                    + this.Component.H.Border.Sum() + this.Component.H.Padding.Sum();

                if (sizeHDesired > this.Component.H.Size.Min) {
                    needScrollHorizontal = true;
                }
            }

            if (needScrollVertical && !needScrollHorizontal) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.Size.Min -= 17;
                this.Component.Measure(SizeDelimiter.Default(), SizeDelimiter.Default());

                this.Component.H.GivedSpace = new Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new Space(0, this.Component.V.ComponentRequired);

                this.Component.H.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;

                Log.RootScrollMeasureAgain++;
            }
            else if (needScrollHorizontal && !needScrollVertical) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.V.Size.Min -= 17;
                this.Component.Measure(SizeDelimiter.Default(), SizeDelimiter.Default());

                this.Component.H.GivedSpace = new Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new Space(0, this.Component.V.ComponentRequired);

                this.Component.V.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;

                Log.RootScrollMeasureAgain++;
            }
            else if (needScrollVertical && needScrollVertical) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.Size.Min -= 17;
                this.Component.V.Size.Min -= 17;
                this.Component.Measure(SizeDelimiter.Default(), SizeDelimiter.Default());

                this.Component.H.GivedSpace = new Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new Space(0, this.Component.V.ComponentRequired);

                this.Component.H.Size.Min += 17;
                this.Component.V.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;

                Log.RootScrollMeasureAgain++;
            }

            super.Arrange();
        }
    }
}
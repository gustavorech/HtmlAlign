
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class WrapCssProperty implements ICssProperty {
        private regExpString: RegExp = /^\s*(\w*).*$/;

        public Name: string = "--wrap";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "left";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var valueString: string = this.regExpString.exec(valueString)[1];

            var wrapBehavior: WrapBehavior = <WrapBehavior>component.Behavior;

            if (valueString == "top")
                wrapBehavior._side = Side.Top;
            else if (valueString == "right")
                wrapBehavior._side = Side.Right;
            else if (valueString == "bottom")
                wrapBehavior._side = Side.Bottom;
            else
                wrapBehavior._side = Side.Left;
        }

        public GetValueStringFromComponent(component: Component): string {
            var wrapBehavior: WrapBehavior = <WrapBehavior>component.Behavior;

            if (wrapBehavior._side == Side.Top)
                return "top";
            else if (wrapBehavior._side == Side.Right)
                return "right";
            else if (wrapBehavior._side == Side.Bottom)
                return "bottom";
            else
                return "left";
        }
    }

    export class WrapBehavior implements IBehavior {
        public Name = "wrap";
        public Component: Component;
        public IsLayoutOverridedInArrange = false;

        static WrapCssProperty = new WrapCssProperty();

        public GetNew(): WrapBehavior {
            return new WrapBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [WrapBehavior.WrapCssProperty];
        }

        public _side: Side;

        // auxiliares
        private _wrapAxis: Axis;
        private _lines: WrapLine[] = [];

        public Measure(): void {
            for (var index = 0; index < this.Component.Children.length; index++) {
                this.Component.Children[index].Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);
            }

            this.ProcessLines(this.Component.H.ContentDelimiter.Max, this.Component.V.ContentDelimiter.Max);

            var maxSumOfSizesInAxis = 0;
            var sumOfMaxSizesInReverseAxis = 0;
            for (var index = 0; index < this._lines.length; index++) {
                var wrapLine = this._lines[index];

                if (wrapLine.SumOfSizesInAxis > maxSumOfSizesInAxis) {
                    maxSumOfSizesInAxis = wrapLine.SumOfSizesInAxis;
                }

                sumOfMaxSizesInReverseAxis += wrapLine.MaxSizeInReverseAxis;
            }

            this.Component.Get(this._wrapAxis).ContentDesired = maxSumOfSizesInAxis;
            this.Component.GetAwry(this._wrapAxis).ContentDesired = sumOfMaxSizesInReverseAxis;
        }

        public Arrange(): void {
            var spaceInAxis: Space = this.Component.Get(this._wrapAxis).ContentSpace.Copy();
            var spaceInReverseAxis: Space = this.Component.GetAwry(this._wrapAxis).ContentSpace.Copy();

            var spaceInAxisCopy: Space = spaceInAxis.Copy();

            for (var lineIndex: number = 0; lineIndex < this._lines.length; lineIndex++) {
                var line: WrapLine = this._lines[lineIndex];
                spaceInReverseAxis.Size = line.MaxSizeInReverseAxis;

                for (var index: number = 0; index < line.Components.length; index++) {
                    var child: Component = line.Components[index];
                    var componentDesizerdSize = child.Get(this._wrapAxis).ComponentRequired;

                    spaceInAxis.Size = componentDesizerdSize;
                    child.Get(this._wrapAxis).GivedSpace = spaceInAxis;
                    child.GetAwry(this._wrapAxis).GivedSpace = spaceInReverseAxis;

                    child.Arrange();

                    spaceInAxis.Displacement += componentDesizerdSize;
                }

                spaceInAxis.CopyFrom(spaceInAxisCopy);
                
                spaceInReverseAxis.Displacement += line.MaxSizeInReverseAxis;
            }
        }

        private ProcessLines(horizontalMax: number, verticalMax: number): void {
            this._lines = [];
            this._wrapAxis = Axis.Vertical;
            var maxSizeInAxis: number = verticalMax;
            if (this._side == Side.Left || this._side == Side.Right) {
                this._wrapAxis = Axis.Horizontal;
                maxSizeInAxis = horizontalMax;
            }

            var currentLine: WrapLine = null;

            if (this._side == Side.Left || this._side == Side.Top) {
                for (var index = 0; index < this.Component.Children.length; index++) {
                    var child: Component = this.Component.Children[index];

                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
            else {
                for (var index = this.Component.Children.length - 1; index >= 0; index--) {
                    var child: Component = this.Component.Children[index];

                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
        }
    }

    export class WrapLine {
        public SumOfSizesInAxis: number;
        public MaxSizeInReverseAxis: number;
        public Components: Component[];

        constructor(public WrapAxis: Axis, public MaxSizeInAxis: number, component: Component) {
            // Se é o primeiro elemento da linha não importa o tamanho dele, ele ficará nessa linha            
            this.SumOfSizesInAxis = component.Get(this.WrapAxis).ComponentRequired;
            this.MaxSizeInReverseAxis = component.GetAwry(this.WrapAxis).ComponentRequired;

            this.Components = [];
            this.Components.push(component);
        }

        public Add(component: Component): boolean {
            var sizeInAxis: number = component.Get(this.WrapAxis).ComponentRequired;
            var sizeInReverseAxis: number = component.GetAwry(this.WrapAxis).ComponentRequired;

            // Se a adição do componente a essa linha faz com que o tamanho extrapole
            // o tamanho máximo esse componente não será inserido nessa linha
            if (Math.fround((this.SumOfSizesInAxis + sizeInAxis)) > Math.fround(this.MaxSizeInAxis)) {
                return false;
            }

            this.SumOfSizesInAxis += sizeInAxis;

            if (sizeInReverseAxis > this.MaxSizeInReverseAxis) {
                this.MaxSizeInReverseAxis = sizeInReverseAxis;
            }

            this.Components.push(component);

            return true;
        }
    }
}

/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class StackCssProperty implements ICssProperty {
        private regExpString: RegExp = /^\s*(\w*).*$/;

        public Name = "--stack";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "left";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var valueString: string = this.regExpString.exec(valueString)[1];

            var stackBehavior: StackBehavior = <StackBehavior>component.Behavior;

            if (valueString == "top")
                stackBehavior.Side = Side.Top;
            else if (valueString == "right")
                stackBehavior.Side = Side.Right;
            else if (valueString == "bottom")
                stackBehavior.Side = Side.Bottom;
            else
                stackBehavior.Side = Side.Left;
        }

        public GetValueStringFromComponent(component: Component): string {
            var stackBehavior: StackBehavior = <StackBehavior>component.Behavior;

            if (stackBehavior.Side == Side.Top)
                return "top";
            else if (stackBehavior.Side == Side.Right)
                return "right";
            else if (stackBehavior.Side == Side.Bottom)
                return "bottom";
            else
                return "left";
        }
    }

    export class StackBehavior implements IBehavior {
        public Name = "stack";
        public Component: Component;
        public IsLayoutOverridedInArrange = false;

        static StackCssProperty: StackCssProperty = new StackCssProperty();

        public GetNew(): StackBehavior {
            return new StackBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [StackBehavior.StackCssProperty];
        }

        public Side: Side;

        private _totalDesiredSizeNotStarInAxis = 0;
        private _starCountInAxis = 0;

        public Measure(): void {
            var axis: Axis = Axis.Vertical;
            if (this.Side == Side.Left || this.Side == Side.Right) {
                axis = Axis.Horizontal;
            }

            this._starCountInAxis = 0;
            this._totalDesiredSizeNotStarInAxis = 0;

            var maxSizeInAwryAxis = 0;

            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                var dimension = child.Get(axis);

                child.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);

                var awryDimension = child.GetAwry(axis);
                if (awryDimension.ComponentRequired > maxSizeInAwryAxis) {
                    maxSizeInAwryAxis = awryDimension.ComponentRequired;
                }

                if (dimension.Star > 0) {
                    this._starCountInAxis += dimension.Star;
                }
                else {
                    this._totalDesiredSizeNotStarInAxis += dimension.ComponentRequired;
                }
            }

            this.Component.Get(axis).ContentDesired = this._totalDesiredSizeNotStarInAxis;
            this.Component.GetAwry(axis).ContentDesired = maxSizeInAwryAxis;
        }

        public Arrange(): void {
            var axis: Axis = Axis.Vertical;
            if (this.Side == Side.Left || this.Side == Side.Right) {
                axis = Axis.Horizontal;
            }

            var spaceInAxis: Space = this.Component.Get(axis).ContentSpace.Copy();
            var spacePerpendicularOfAxis: Space = this.Component.GetAwry(axis).ContentSpace;

            var starPortionSize = 0;
            if (this._starCountInAxis > 0 && spaceInAxis.Size > this._totalDesiredSizeNotStarInAxis) {
                starPortionSize = (spaceInAxis.Size - this._totalDesiredSizeNotStarInAxis) / this._starCountInAxis;
            }

            if (this.Side == Side.Left || this.Side == Side.Top) {
                for (var index = 0; index < this.Component.Children.length; index++) {
                    var child: Component = this.Component.Children[index];
                    var dimension = child.Get(axis);

                    if (dimension.Star) {
                        spaceInAxis.Size = starPortionSize * dimension.Star;
                    }
                    else {
                        spaceInAxis.Size = dimension.ComponentRequired;
                    }

                    dimension.GivedSpace = spaceInAxis;
                    child.GetAwry(axis).GivedSpace = spacePerpendicularOfAxis;

                    child.Arrange();
                    
                    spaceInAxis.Displacement += spaceInAxis.Size;
                }
            }
            else {
                for (var index = this.Component.Children.length - 1; index >= 0; index--) {
                    var child: Component = this.Component.Children[index];
                    var dimension = child.Get(axis);

                    if (dimension.Star) {
                        spaceInAxis.Size = starPortionSize;
                    }
                    else {
                        spaceInAxis.Size = dimension.ComponentRequired;
                    }

                    dimension.GivedSpace = spaceInAxis;
                    child.GetAwry(axis).GivedSpace = spacePerpendicularOfAxis;

                    child.Arrange();

                    spaceInAxis.Displacement += spaceInAxis.Size;
                }
            }
        }
    }
}
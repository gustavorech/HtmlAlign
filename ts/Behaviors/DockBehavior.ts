
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class DockCssProperty implements ICssProperty {
        private regExpString: RegExp = /^\s*(\w*).*$/;

        public Name: string = "--dock";
        public Context: CssPropertyContext = CssPropertyContext.Child;

        public DefaultValue(): string {
            return "left";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var valueString: string = this.regExpString.exec(valueString)[1];

            if (valueString == "top")
                component.FatherAttached["Side"] = Side.Top;
            else if (valueString == "right")
                component.FatherAttached["Side"] = Side.Right;
            else if (valueString == "bottom")
                component.FatherAttached["Side"] = Side.Bottom;
            else if (valueString == "left")
                component.FatherAttached["Side"] = Side.Left;
            else
                component.FatherAttached["Side"] = Side.All;
        }

        public GetValueStringFromComponent(component: Component): string {
            if (component.FatherAttached["Side"] == Side.Top)
                return "top";
            else if (component.FatherAttached["Side"] == Side.Right)
                return "right";
            else if (component.FatherAttached["Side"] == Side.Bottom)
                return "bottom";
            else if (component.FatherAttached["Side"] == Side.Left)
                return "left";
            else
                return "fit";
        }
    }

    export class DockBehavior implements IBehavior {
        public Name = "dock";
        public Component: Component;
        public IsLayoutOverridedInArrange = false;

        static DockCssPropery = new DockCssProperty();

        public GetNew(): DockBehavior {
            return new DockBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [DockBehavior.DockCssPropery];
        }

        public Measure(): void {
            var totalSumRect = Rect.Default();
            var desiredRect = Rect.Default();

            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter)

                var axis = Axis.Vertical;
                if (child.FatherAttached["Side"] == Side.Left
                    || child.FatherAttached["Side"] == Side.Right) {
                    axis = Axis.Horizontal;
                }

                totalSumRect.Set(axis, totalSumRect.Get(axis) + child.Get(axis).ComponentRequired);

                if (desiredRect.Get(axis) < totalSumRect.Get(axis)) {
                    desiredRect.Set(axis, totalSumRect.Get(axis));
                }

                var maxInAwryAxis = child.GetAwry(axis).ComponentRequired
                    + totalSumRect.GetAwry(axis);

                if (desiredRect.GetAwry(axis) < maxInAwryAxis) {
                    desiredRect.SetAwry(axis, maxInAwryAxis);
                }

                if (child.FatherAttached["Side"] == Side.All) {
                    break;
                }
            }

            this.Component.H.ContentDesired = desiredRect.H;
            this.Component.V.ContentDesired = desiredRect.V;
        }

        public Arrange(): void {
            var sizeRect = new Rect(this.Component.H.ContentSpace.Size, this.Component.V.ContentSpace.Size);
            var displacementRect = new Rect(this.Component.H.ContentSpace.Displacement, this.Component.V.ContentSpace.Displacement);

            var clearNext = false;
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];

                if (clearNext) {
                    child.H.GivedSpace = Space.Default();
                    child.V.GivedSpace = Space.Default();

                    child.Arrange();
                    continue;
                }

                if (child.FatherAttached["Side"] == Side.All) {
                    child.H.GivedSpace = new Space(displacementRect.H, sizeRect.H);
                    child.V.GivedSpace = new Space(displacementRect.V, sizeRect.V);

                    child.Arrange();

                    clearNext = true;
                    continue;
                }

                var axis = Axis.Vertical;
                if (child.FatherAttached["Side"] == Side.Left
                    || child.FatherAttached["Side"] == Side.Right) {
                    axis = Axis.Horizontal;
                }

                var sizeInAxis = child.Get(axis).ComponentRequired;
                if (sizeInAxis >= sizeRect.Get(axis)) {
                    sizeInAxis = sizeRect.Get(axis);
                    clearNext = true;
                }

                if (!clearNext && (child.FatherAttached["Side"] == Side.Right
                    || child.FatherAttached["Side"] == Side.Bottom)) {

                    child.Get(axis).GivedSpace = new Space(displacementRect.Get(axis)
                        + sizeRect.Get(axis) - sizeInAxis, sizeInAxis);
                }
                else {
                    child.Get(axis).GivedSpace = new Space(displacementRect.Get(axis), sizeInAxis);

                    displacementRect.Set(axis, displacementRect.Get(axis) + sizeInAxis);
                }

                child.GetAwry(axis).GivedSpace = new Space(displacementRect.GetAwry(axis),
                    sizeRect.GetAwry(axis));

                sizeRect.Set(axis, sizeRect.Get(axis) - sizeInAxis);

                child.Arrange();
            }
        }
    }
}
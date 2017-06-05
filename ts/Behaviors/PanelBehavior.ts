
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class BehaviorCssProperty implements ICssProperty {
        private regExpString: RegExp = /^\s*(\w*).*$/;

        public Name: string = "--behavior";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "panel";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.Behavior = Layout.GetBehavior(component, this.regExpString.exec(valueString)[1]);

            if (component.Behavior != null) {
                component.Behavior.Component = component;
            }
        }

        public GetValueStringFromComponent(component: Component): string {
            return Layout.GetBehaviorName(component);
        }
    }

    export class AlignCssProperty implements ICssProperty {
        private regExpAlign = /^\s*(left|right|top|bottom|center|streach){0,1}\s*(left|right|top|bottom|center|streach){0,1}.*$/;

        public Name: string = "--align";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "streach";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var matchsAlign: RegExpExecArray = this.regExpAlign.exec(valueString);
            var horizontal: string = matchsAlign[1];
            var vertical: string = matchsAlign[2];

            component.H.Align = Align.Streach;
            component.V.Align = Align.Streach;

            var nextAxis = this.ReadAlign(Axis.Horizontal, horizontal, component);

            if (vertical == null) {
                if (horizontal == "streach" || horizontal == "center") {
                    this.ReadAlign(nextAxis, horizontal, component);
                }
            }
            else {
                this.ReadAlign(nextAxis, vertical, component);
            }
        }

        public ReadAlign(axis: Axis, valueString: string, component: Component): Axis {
            if (valueString == "left") {
                if (axis == Axis.Vertical) {
                    component.V.Align = component.H.Align;
                }

                component.H.Align = Align.Start;
                return Axis.Vertical;
            }
            else if (valueString == "right") {
                if (axis == Axis.Vertical) {
                    component.V.Align = component.H.Align;
                }

                component.H.Align = Align.End;
                return Axis.Vertical;
            }
            else if (valueString == "top") {
                component.V.Align = Align.Start;
                return Axis.Horizontal;
            }
            else if (valueString == "bottom") {
                component.V.Align = Align.End;
                return Axis.Horizontal;
            }
            else if (valueString == "center") {
                component.Get(axis).Align = Align.Center;
                return Axis.Vertical;
            }
            else {
                component.Get(axis).Align = Align.Streach;
                return Axis.Vertical;
            }
        }

        public GetValueStringFromComponent(component: Component): string {
            var horizontal: string = "left";
            var vertical: string = "top";

            if (component.H.Align == Align.End) {
                horizontal = "right";
            }
            else if (component.H.Align == Align.Center) {
                horizontal = "center";
            }
            else if (component.H.Align == Align.Streach) {
                horizontal = "streach";
            }

            if (component.V.Align == Align.End) {
                horizontal = "bottom";
            }
            else if (component.V.Align == Align.Center) {
                horizontal = "center";
            }
            else if (component.V.Align == Align.Streach) {
                horizontal = "streach";
            }

            if (horizontal == vertical) {
                return horizontal;
            }

            return horizontal + " " + vertical;
        }
    }

    export class SizeCssProperty implements ICssProperty {
        private regExpSize: RegExp = /^\s*(\d*[.]?\d*)([%]([\[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?)(?:\s+(\d*[.]?\d*)([%]([\[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?))?.*$/;
        private readonly Default: SizeRange = SizeRange.Default();

        public Name: string = "--size";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "~";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var matchsSize: RegExpExecArray = this.regExpSize.exec(valueString);

            component.H.Size =
                this.ReadSizeRange(matchsSize[1], matchsSize[2], matchsSize[4],
                    matchsSize[5], matchsSize[6], matchsSize[7], matchsSize[8], this.Default);

            component.V.Size =
                this.ReadSizeRange(matchsSize[9], matchsSize[10], matchsSize[12],
                    matchsSize[13], matchsSize[14], matchsSize[15], matchsSize[16], component.H.Size);
        }

        public GetValueStringFromComponent(component: Component): string {
            return component.H.Size.toString() + " " + component.V.Size.toString();
        }

        public ReadSizeRange(min: string, minPercentDesc: string, minPercentValue: string,
            maxPercentValue: string, type: string, max: string, maxPercent: string, def: SizeRange): SizeRange {
            
            if (minPercentDesc && minPercentDesc.length > 1) {
                return new SizeRange(0, parseFloat(min) || 100, parseFloat(minPercentValue) || 0,
                    false, parseFloat(maxPercentValue) || Number.POSITIVE_INFINITY, false);
            }

            var minIsPercent = minPercentDesc == "%";
            var maxIsPercent = maxPercent == "%";

            if (!type && !min && min != "0") {
                return new SizeRange(def.Star, 0, def.Min, def.MinIsPercent, def.Max, def.MaxIsPercent);
            }
            else if (type == "~") {
                return new SizeRange(0, 0, parseFloat(min) || 0, minIsPercent,
                    parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
            }
            else if (type == "*") {
                return new SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
            }
            else if (min == "0") {
                return new SizeRange(0, 0, 0, false, 0, false);
            }
            else {
                return new SizeRange(0, 0, parseFloat(min) || 0, minIsPercent,
                    parseFloat(min) || Number.POSITIVE_INFINITY, minIsPercent);
            }
        }
    }

    export class CascadeUpdateCssProperty implements ICssProperty {
        private cascadeExpAlign = /^\s*(none|all|\d*).*$/;

        public Name = "--cascade";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "none";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var matchsCascade: RegExpExecArray = this.cascadeExpAlign.exec(valueString);
            var cascade: string = matchsCascade[1];

            if (!cascade || cascade == "none") {
                component.CascadeUpdateLength = 0;
            }
            else if (cascade == "all") {
                component.CascadeUpdateLength = Number.POSITIVE_INFINITY;
            }
            else {
                component.CascadeUpdateLength = Number.parseInt(cascade) || 0;
            }
        }
        public GetValueStringFromComponent(component: Component): string {
            if (component.CascadeUpdateLength == 0) {
                return "none";
            }
            else if (component.CascadeUpdateLength == Number.POSITIVE_INFINITY) {
                return "all";
            }
            else {
                return component.CascadeUpdateLength.toString();
            }
        }
    }

    export class HoverCssProperty implements ICssProperty {
        private hoverExpAlign = /^\s*(none|refresh).*$/;

        public Name = "--hover";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "none";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var matchsHover: RegExpExecArray = this.hoverExpAlign.exec(valueString);
            var hover
                : string = matchsHover[1];

            if (!hover || hover == "none") {
                component.UpdateOnHover = false;
            }
            else {
                component.UpdateOnHover = true;
            }
        }
        public GetValueStringFromComponent(component: Component): string {
            if (!component.UpdateOnHover) {
                return "none";
            }
            else {
                return "update";
            }
        }
    }

    export class DisplayCssProperty implements ICssProperty {
        public Name = "display";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "block";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            if (valueString.startsWith("none")) {
                component.Visible = false;
            }
            else {
                component.Visible = true;
            }
        }
        public GetValueStringFromComponent(component: Component): string {
            if (component.Visible) {
                return "block";
            }
            else {
                return "none";
            }
        }
    }

    export class ScrollCssProperty implements ICssProperty {
        private regExpScroll = /^\s*(auto|overlay|hidden|scroll|visible){0,1}\s*(auto|overlay|hidden|scroll|visible){0,1}.*$/;

        public Name = "overflow";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "hidden";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var matchsAlign: RegExpExecArray = this.regExpScroll.exec(valueString);
            var horizontal = matchsAlign[1];
            var vertical = matchsAlign[2] || horizontal;

            if (horizontal == "auto" || horizontal == "overlay") {
                component.HorizontalScroll = Scroll.Auto;
            }
            else if (horizontal == "scroll") {
                component.HorizontalScroll = Scroll.Visible;
            }
            else {
                component.HorizontalScroll = Scroll.None;
            }

            if (vertical == "auto" || vertical == "overlay") {
                component.VerticalScroll = Scroll.Auto;
            }
            else if (vertical == "scroll") {
                component.VerticalScroll = Scroll.Visible;
            }
            else {
                component.VerticalScroll = Scroll.None;
            }
        }
        public GetValueStringFromComponent(component: Component): string {
            if (component.Visible) {
                return "block";
            }
            else {
                return "none";
            }
        }
    }

    export class MarginLeftCssProperty implements ICssProperty {
        public Name = "margin-left";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Margin.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Margin.Start.toString() + "px";
        }
    }

    export class MarginTopCssProperty implements ICssProperty {
        public Name = "margin-top";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Margin.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Margin.Start.toString() + "px";
        }
    }

    export class MarginRightCssProperty implements ICssProperty {
        public Name = "margin-right";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Margin.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Margin.End.toString() + "px";
        }
    }

    export class MarginBottomCssProperty implements ICssProperty {
        public Name = "margin-bottom";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Margin.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Margin.End.toString() + "px";
        }
    }

    export class BorderLeftCssProperty implements ICssProperty {
        public Name = "border-left-width";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Border.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Border.Start.toString() + "px";
        }
    }

    export class BorderTopCssProperty implements ICssProperty {
        public Name = "border-top-width";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Border.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Border.Start.toString() + "px";
        }
    }

    export class BorderRightCssProperty implements ICssProperty {
        public Name = "border-right-width";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Border.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Border.End.toString() + "px";
        }
    }

    export class BorderBottomCssProperty implements ICssProperty {
        public Name = "border-bottom-width";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Border.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Border.End.toString() + "px";
        }
    }

    export class PaddingLeftCssProperty implements ICssProperty {
        public Name = "padding-left";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Padding.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Padding.Start.toString() + "px";
        }
    }

    export class PaddingTopCssProperty implements ICssProperty {
        public Name = "padding-top";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Padding.Start = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Padding.Start.toString() + "px";
        }
    }

    export class PaddingRightCssProperty implements ICssProperty {
        public Name = "padding-right";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.H.Padding.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.H.Padding.End.toString() + "px";
        }
    }

    export class PaddingBottomCssProperty implements ICssProperty {
        public Name = "padding-bottom";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return null;
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            component.V.Padding.End = Number.parseInt(valueString);
        }
        public GetValueStringFromComponent(component: Component): string {
            return component.V.Padding.End.toString() + "px";
        }
    }

    export class PanelBehavior implements IBehavior {
        static BehaviorCssProperty = new BehaviorCssProperty();
        static AlignCssProperty = new AlignCssProperty();
        static SizeCssProperty = new SizeCssProperty();
        static DisplayCssProperty = new DisplayCssProperty();
        static ScrollCssProperty = new ScrollCssProperty();

        static MarginLeftCssProperty = new MarginLeftCssProperty();
        static MarginTopCssProperty = new MarginTopCssProperty();
        static MarginRightCssProperty = new MarginRightCssProperty();
        static MarginBottomCssProperty = new MarginBottomCssProperty();
        static BorderLeftCssProperty = new BorderLeftCssProperty();
        static BorderTopCssProperty = new BorderTopCssProperty();
        static BorderRightCssProperty = new BorderRightCssProperty();
        static BorderBottomCssProperty = new BorderBottomCssProperty();
        static PaddingLeftCssProperty = new PaddingLeftCssProperty();
        static PaddingTopCssProperty = new PaddingTopCssProperty();
        static PaddingRightCssProperty = new PaddingRightCssProperty();
        static PaddingBottomCssProperty = new PaddingBottomCssProperty();

        public Name = "panel"; 
        public Component: Component;
        public IsLayoutOverridedInArrange = false;

        public GetNew() {
            return new PanelBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [PanelBehavior.BehaviorCssProperty, PanelBehavior.AlignCssProperty,
                PanelBehavior.SizeCssProperty, PanelBehavior.DisplayCssProperty,
                PanelBehavior.ScrollCssProperty, PanelBehavior.MarginLeftCssProperty,
                PanelBehavior.MarginTopCssProperty, PanelBehavior.MarginRightCssProperty,
                PanelBehavior.MarginBottomCssProperty, PanelBehavior.BorderLeftCssProperty,
                PanelBehavior.BorderTopCssProperty, PanelBehavior.BorderRightCssProperty,
                PanelBehavior.BorderBottomCssProperty, PanelBehavior.PaddingLeftCssProperty,
                PanelBehavior.PaddingTopCssProperty, PanelBehavior.PaddingRightCssProperty,
                PanelBehavior.PaddingBottomCssProperty];
        }

        public Measure(): void {
            var maxHorizontalContentSize = 0;
            var maxVerticalContentSize = 0;
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];

                child.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);

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
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.H.GivedSpace = this.Component.H.ContentSpace;
                child.V.GivedSpace = this.Component.V.ContentSpace;

                child.Arrange();
            }
        }
    }
}
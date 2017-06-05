
/// <reference path='../Component.ts'/>

// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform

namespace HtmlAlign {

    export class FitCssProperty implements ICssProperty {
        private regExpString: RegExp = /^\s*(\w*).*$/;

        public Name = "--fit";
        public Context: CssPropertyContext = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "uniform";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var valueString: string = this.regExpString.exec(valueString)[1];

            var fitBehavior: FitBehavior = <FitBehavior>component.Behavior;

            if (valueString == "fit")
                fitBehavior.Fit = Fit.Fit;
            else if (valueString == "horizontal")
                fitBehavior.Fit = Fit.Horizontal;
            else if (valueString == "vertical")
                fitBehavior.Fit = Fit.Vertical;
            else
                fitBehavior.Fit = Fit.Uniform;
        }

        public GetValueStringFromComponent(component: Component): string {
            var fitBehavior: FitBehavior = <FitBehavior>component.Behavior;

            if (fitBehavior.Fit == Fit.Fit)
                return "fit";
            else if (fitBehavior.Fit == Fit.Horizontal)
                return "horizontal";
            else if (fitBehavior.Fit == Fit.Vertical)
                return "vertical";
            else
                return "uniform";
        }
    }

    export class FitBehavior extends PanelBehavior implements IBehavior {
        public Name = "fit";
        public Component: Component;
        public IsLayoutOverridedInArrange = true;

        static FitCssProperty: FitCssProperty = new FitCssProperty();

        public GetNew(): FitBehavior {
            return new FitBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [FitBehavior.FitCssProperty];
        }

        public Fit: Fit;

        public Measure(): void {
            var value = this.Component.Element.style.getPropertyValue("transform");
            this.OnDispose();

            super.Measure();

            this.Component.Element.style.setProperty("transform", value);

            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }

        public Arrange(): void {

            super.Arrange();

            // se o espaço determinado para o componente foi modificado ele precisará
            // atualizar o layout
            var width = this.Component.H.ComponentSpace.Size;
            var height = this.Component.V.ComponentSpace.Size;

            if (width < 0) {
                width = 0;
            }

            if (height < 0) {
                height = 0;
            }

            this.Component.Element.style.width = width + "px";
            this.Component.Element.style.left = this.Component.H.ComponentSpace.Displacement + "px";
            this.Component.Element.style.height = height + "px";
            this.Component.Element.style.top = this.Component.V.ComponentSpace.Displacement + "px";

            var uniformWidth = this.Component.Father.H.ContentSpace.Size
                / this.Component.H.ComponentDesired;

            var uniformHeight = this.Component.Father.V.ContentSpace.Size
                / this.Component.V.ComponentDesired;

            var transformOriginH = 0;
            var transformOriginV = 0;

            if (this.Component.H.Align == Align.Center) {
                transformOriginH = this.Component.H.ComponentRequired / 2;
            }
            else if (this.Component.H.Align == Align.End) {
                transformOriginH = this.Component.H.ComponentRequired;
            }
            else if (this.Component.H.Align == Align.Streach) {
                uniformWidth = 1;
            }

            if (this.Component.V.Align == Align.Center) {
                transformOriginV = this.Component.V.ComponentRequired / 2;
            }
            else if (this.Component.V.Align == Align.End) {
                transformOriginV = this.Component.V.ComponentRequired;
            }
            else if (this.Component.V.Align == Align.Streach) {
                uniformHeight = 1;
            }

            this.Component.Element.style.transformOrigin = transformOriginH + "px " + transformOriginV + "px";

            if (this.Fit == Fit.Uniform) {
                this.Component.Element.style.transform = "scale(" + Math.min(uniformWidth, uniformHeight) + ")";
            }
            else if (this.Fit == Fit.Fit) {
                this.Component.Element.style.transform = "scale(" + uniformWidth + "," + uniformHeight + ")";

            }
            else if (this.Fit == Fit.Horizontal) {
                this.Component.Element.style.transform = "scale(" + uniformWidth + ",1)";
            }
            else if (this.Fit == Fit.Vertical) {
                this.Component.Element.style.transform = "scale(1," + uniformHeight + ")";
            }

            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }

        public OnDispose(): void {
            this.Component.Element.style.removeProperty("transform");

            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }
    }
}
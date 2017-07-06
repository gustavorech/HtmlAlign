
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class InBehavior implements IBehavior {
        public Name = "in"; 
        public Component: Component;
        public IsLayoutOverridedInArrange = true;
        
        private _widthIsMaxContent = false;
        private _heightIsMaxContent = false;
        private _needInformLastStyle = false;

        public GetNew() {
            return new InBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
            return [];
        }

        public Measure(): void {
            // se o tamanho for fixo não há motivo para perguntar para o conteúdo
            // qual o tamanho que ele deseja para si
            if (this.Component.H.IsFixed && this.Component.V.IsFixed) {
                this._widthIsMaxContent = false;
                this._heightIsMaxContent = false;
                this.Component.H.ContentDesired = 0;
                this.Component.V.ContentDesired = 0;
            }
            else {
                // se modificar as propriedades abaixo na primeria medida o tempo é muito alto
                if (!this._widthIsMaxContent) {
                    this._widthIsMaxContent = true;
                    this.Component.Element.style.removeProperty("width");

                    this._needInformLastStyle = true;
                }

                if (!this._heightIsMaxContent) {
                    this._heightIsMaxContent = true;
                    this.Component.Element.style.removeProperty("height");

                    this._needInformLastStyle = true;
                }

                var maxHorizontal = this.Component.H.GivedDelimiter.Max - this.Component.H.Margin.Sum();

                // maior ou igual porque o clientWidth só informa a parte inteira do número
                if (this.Component.Element.clientWidth >= maxHorizontal) {
                    this.Component.Element.style.setProperty("width", maxHorizontal + "px");
                    this._widthIsMaxContent = false;

                    if (!this._heightIsMaxContent) {
                        this._heightIsMaxContent = true;
                        this.Component.Element.style.removeProperty("height");
                    }

                    this._needInformLastStyle = true;
                }

                if (this._needInformLastStyle) {
                    this._needInformLastStyle = false;

                    // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
                    this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
                }

                var rect = this.Component.Element.getBoundingClientRect();

                this.Component.H.ContentDesired =
                    rect.width - this.Component.H.Border.Sum() - this.Component.H.Padding.Sum();

                this.Component.V.ContentDesired =
                    rect.height - this.Component.V.Border.Sum() - this.Component.V.Padding.Sum();
                
                //this.Component.H.ActualSize = rect.width;
                //this.Component.V.ActualSize = rect.height;
            }
        }

        public Arrange(): void {
            if (this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {

                this.Component.H.GivedDelimiter = new SizeDelimiter(this.Component.H.GivedSpace.Size, this.Component.H.GivedSpace.Size);
                this.Component.V.GivedDelimiter = new SizeDelimiter(this.Component.V.GivedSpace.Size, this.Component.V.GivedSpace.Size);

                this.Measure();

                if (this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {
                    this._widthIsMaxContent = false;
                }
                else {
                    this.Component.H.ActualSize = this.Component.H.ComponentSpace.Size;
                }
            }

            if (this.Component.V.ComponentDesired != this.Component.V.GivedSpace.Size) {
                this._heightIsMaxContent = false;
            }
            else {
                this.Component.V.ActualSize = this.Component.V.ComponentSpace.Size;
            }

            if (this.Component.H.NeedLayout || this.Component.V.NeedLayout) {
                this.Component.NotifyNeedLayout();
            }

        }
    }
}
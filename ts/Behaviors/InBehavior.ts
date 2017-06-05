
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
                    this.Component.Element.style.width = Layout.MaxContentString;

                    this._needInformLastStyle = true;
                }

                if (!this._heightIsMaxContent) {
                    this._heightIsMaxContent = true;
                    this.Component.Element.style.height = Layout.MaxContentString;

                    this._needInformLastStyle = true;
                }

                var maxHorizontal = this.Component.H.GivedDelimiter.Max - this.Component.H.Margin.Sum();

                // maior ou igual porque o clientWidth só informa a parte inteira do número
                if (this.Component.Element.clientWidth >= maxHorizontal) {
                    this.Component.Element.style.width = maxHorizontal + "px";
                    this._widthIsMaxContent = false;

                    if (!this._heightIsMaxContent) {
                        this._heightIsMaxContent = true;
                        this.Component.Element.style.height = Layout.MaxContentString;
                    }

                    this._needInformLastStyle = true;
                }

                if (this._needInformLastStyle) {
                    this._needInformLastStyle = false;

                    // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
                    this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
                }

                var rect = this.Component.Element.getBoundingClientRect();

                this.Component.H.ContentDesired = rect.width - this.Component.H.Border.Sum() - this.Component.H.Padding.Sum();
                this.Component.V.ContentDesired = rect.height - this.Component.V.Border.Sum() - this.Component.V.Padding.Sum();
            }
        }

        public Arrange(): void {
            if (this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {

                this.Component.H.GivedDelimiter = new SizeDelimiter(this.Component.H.GivedSpace.Size, this.Component.H.GivedSpace.Size);
                this.Component.V.GivedDelimiter = new SizeDelimiter(this.Component.V.GivedSpace.Size, this.Component.V.GivedSpace.Size);

                this.Measure();

                if (this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {
                    this._widthIsMaxContent = false;
                    var width = this.Component.H.ComponentSpace.Size;

                    if (width < 0) {
                        width = 0;
                    }

                    this.Component.Element.style.width = width + "px";
                }
            }

            if (this.Component.V.ComponentDesired != this.Component.V.GivedSpace.Size) {
                this._heightIsMaxContent = false;
                var height = this.Component.V.ComponentSpace.Size;

                if (height < 0) {
                    height = 0;
                }

                this.Component.Element.style.height = height + "px";
            }

            //if (!this._widthIsMaxContent || this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {
            //    this._widthIsMaxContent = false;
            //    var width = this.Component.H.ComponentSpace.Size;

            //    if (width < 0) {
            //        width = 0;
            //    }

            //    this.Component.Element.style.width = width + "px";
            //}

            //if (!this._heightIsMaxContent || this.Component.V.ComponentDesired != this.Component.V.GivedSpace.Size) {
            //    this._heightIsMaxContent = false;
            //    var height = this.Component.V.ComponentSpace.Size;

            //    if (height < 0) {
            //        height = 0;
            //    }

            //    this.Component.Element.style.height = height + "px";
            //}
            
            this.Component.Element.style.left = this.Component.H.ComponentSpace.Displacement + "px";
            this.Component.Element.style.top = this.Component.V.ComponentSpace.Displacement + "px";

            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }
    }
}

/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>

namespace HtmlAlign {
    export class Dimension {

        public FatherIsPanel = true;
        public Visible = true;
        public Scroll = Scroll.None;
        public Align = Align.Start;
        public Size = SizeRange.Default();
        public Margin = Thickness.Default();
        public Border = Thickness.Default();
        public Padding = Thickness.Default();

        public IsComponentDelimiterChanged = false;
        public IsComponentDesiredChanged = false;
        public IsNeedMeasureAgain = false;
        public IsComponentDisplacementChanged = false;
        public IsComponentSizeChanged = false;
        public IsComponentSpaceChanged = false;

        private _givedDelimiter = SizeDelimiter.Default();
        private _componentDelimiter = SizeDelimiter.Default();
        private _contentDelimiter = SizeDelimiter.Default();
        private _contentDesired = 0;
        private _componentDesired = 0;
        private _componentRequired = 0;
        private _savedComponentDesired = 0;
        private _givedSpace = Space.Default();
        private _componentSpace = Space.Default();
        private _contentSpace = Space.Default();

        public get GivedDelimiter(): SizeDelimiter { return this._givedDelimiter; }
        public get ComponentDelimiter(): SizeDelimiter { return this._componentDelimiter; }
        public get ContentDelimiter(): SizeDelimiter { return this._contentDelimiter; }
        public get ContentDesired(): number { return this._contentDesired; }
        public get ComponentDesired(): number { return this._componentDesired; }
        public get ComponentRequired(): number { return this._componentRequired; }
        public get GivedSpace(): Space { return this._givedSpace; }
        public get ComponentSpace(): Space { return this._componentSpace; }
        public get ContentSpace(): Space { return this._contentSpace; }

        // [TODO] precisa analisar
        // informa se o tamanho dessa dimensão é fixa
        public get IsFixed(): boolean {
            return this.Size.MinIsPercent == this.Size.MaxIsPercent
                && this.Size.Star == 0
                && !this.Size.MinIsPercent
                && this.Size.Min == this.Size.Max;
        }

        // [TODO] precisa analisar
        // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
        // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
        // ao componente pai ele precisará ser rearranjado
        public get NeedArrange(): boolean {
            return this.IsComponentDesiredChanged
                || (this.IsComponentDelimiterChanged
                && (this.Size.MinIsPercent
                    || this.Size.MaxIsPercent
                    || this.Size.Star > 0
                    || (this.Align == Align.Streach && this.Size.Max == Number.POSITIVE_INFINITY)));
        }

        // [TODO] precisa analisar
        public get Star(): number {
            if (!this.Visible) {
                return 0;
            }

            return this.Size.Star;
        }

        // passo 1: behavior informa a delimitação de tamanho
        // componente verifica qual sua delimitação e a do conteúdo
        public set GivedDelimiter(value: SizeDelimiter) {
            // inicialização
            this._givedDelimiter.CopyFrom(value);
            // salva valores antigos para verificar mudança
            var lastComponentDelimiterMin = this._componentDelimiter.Min;
            var lastComponentDelimiterMax = this._componentDelimiter.Max;

            // se o valor for proporcional ou percentual a margem do componente deve
            // estar incluída no delimitador

            // se for * apenas assume o delimitador entregue pelo componente
            // pai na integra, provavelmente o componente precisará ser medido uma
            // segunda vez
            if (this.Size.Star > 0) {
                this._componentDelimiter.CopyFrom(this._givedDelimiter);
            }
            // se não ou calcula as porcentagens caso as extremidades forem porcentagens
            // ou assume exatamente o que o componente quer
            // se o componente tiver tamanho percentual mínimo pode haver necessidade de uma nova medida
            // se o componente tiver alinhamento streach e o tamanho máximo for infinito
            // pode haver a necessidade de uma nova medida
            // as necessidades de novas medidas são condicionais a ampliação do tamanho do componente
            // pai e isso será conhecido no passo de arranjo
            else {
                if (this.Size.MinIsPercent) {
                    this._componentDelimiter.Min = this._givedDelimiter.Min * this.Size.Min / 100; 
                }
                else {
                    this._componentDelimiter.Min = this.Size.Min + this.Margin.Sum();
                }

                if (this.Size.MaxIsPercent) {
                    this._componentDelimiter.Max = this._givedDelimiter.Max * this.Size.Max / 100;
                }
                else {
                    this._componentDelimiter.Max = this.Size.Max + this.Margin.Sum();
                }                

                // [TODO] possível heurística: se o compoente for streach com máximo infinito
                // * ou percentual, observar os elementos irmãos para tentar diminuir a
                // propabilidade de ocorrer uma nova mdida
            }

            // o mínimo tem maior precedência, então se por algum motivo o mínimo for
            // maior que o máximo, substitui o tamanho máximo pelo mínimo
            if (this._componentDelimiter.Min > this._componentDelimiter.Max) {
                this._componentDelimiter.Max = this._componentDelimiter.Min;
            }
            // caso especial, o mínimo é percentual e o máximo não é percentual
            else if (this.Size.MinIsPercent && !this.Size.MaxIsPercent) {
                this._componentDelimiter.Min = this._componentDelimiter.Max;
            }

            // se o alinhamento for Streach e não há máximo, e o delimitador máximo passado
            // pelo componente pai não for infinito, e o tamanho mínimo do componente é menor
            // que o tamanho máximo passado pelo delimitador do componente pai
            // tenta reduzir a probabilidade de um novo measure tornando o delimitador
            // mínimo igual ao máximo do delimitador passado
            // faz isso somente se o componente pai é um panel
            if (this.FatherIsPanel && this.Size.Star == 0
                && this.GivedDelimiter.Max != Number.POSITIVE_INFINITY
                && this.Size.Max == Number.POSITIVE_INFINITY && this.Align == Align.Streach
                && this._componentDelimiter.Min < this._givedDelimiter.Max) {

                this._componentDelimiter.Min = this._givedDelimiter.Max;
            }

            // verifica qual a delimitação do conteúdo que é a delimitação do componente
            // menos seus espaçamentos e borda
            var totalSpacing = this.Margin.Sum() + this.Border.Sum() + this.Padding.Sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.Scroll == Scroll.Visible) {
                totalSpacing += 17;
            }

            this._contentDelimiter.Max = this._componentDelimiter.Max - totalSpacing;
            this._contentDelimiter.Min = this._componentDelimiter.Min - totalSpacing;

            // ajusta o delimitador do componente se a porcentagem for maior que 100%
            if (this.Size.Star == 0) {
                if (this.Size.MinIsPercent && this.Size.Min > 100) {
                    this._componentDelimiter.Min = this._givedDelimiter.Min;
                }

                if (this.Size.MaxIsPercent && this.Size.Max > 100) {
                    this._componentDelimiter.Max = this._givedDelimiter.Max;
                }
            }

            // verifica mudança e sinaliza caso houve
            this.IsComponentDelimiterChanged =
                this._componentDelimiter.Min != lastComponentDelimiterMin
                || this._componentDelimiter.Max != lastComponentDelimiterMax;
        }

        // passo 2: behavior informa, segundo suas regras, qual o tamanho
        // que precisará para o conteúdo
        // componente verifica qual o tamanho desejado e quanto irá requerer
        // do componente pai
        public set ContentDesired(value: number) {
            // inicialização
            this._contentDesired = value;
            // salva valor antigo para verificar mudança
            var lastComponentDesired = this._componentRequired;

            // o que o componente deseja é o que o seu conteúdo deseja mais
            // seus espaçamentos
            this._componentDesired = this._contentDesired
                + this.Margin.Sum() + this.Border.Sum() + this.Padding.Sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.Scroll == Scroll.Visible) {
                this._componentDesired += 17;
            }

            this._componentRequired = this._componentDesired;

            // se o pai for um Panel e o tamanho máximo for percentual
            // informa o tamanho máximo já incluindo a porcentagem
            if (this.FatherIsPanel && this.Size.MaxIsPercent) {
                // salva o valor desejado correto e verifica pelo mínimo
                this._savedComponentDesired = this._componentRequired;
                if (this._savedComponentDesired < this._componentDelimiter.Min) {
                    this._savedComponentDesired = this._componentDelimiter.Min;
                }

                this._componentRequired = this._componentRequired * 100 / this.Size.Max;
            }

            // verifica o delimitador desejado pelo componente, um componente nunca deseja mais que
            // o seu delimitador
            if (this._componentRequired < this._componentDelimiter.Min) {
                this._componentRequired = this._componentDelimiter.Min;
            }
            else if (this._componentRequired > this._componentDelimiter.Max) {
                this._componentRequired = this._componentDelimiter.Max;
            }
            // caso contrário o tamanho já estava no intervalo, mas isso não garante
            // que não seja necessário uma nova medida

            // verifica mudança e sinaliza caso houve
            this.IsComponentDesiredChanged = this._componentRequired != lastComponentDesired;
        }

        // passo 3: behavior informa o espaço final decidido para o componente
        // componente verifica o espaço que irá ocupar conforme seu arranjo
        // componente verifica qual o espaço para o conteúdo
        public set GivedSpace(value: Space) {
            // inicialização
            this._givedSpace.CopyFrom(value);
            // salva valores antigos para verificar mudança
            var lastComponentSpaceDisplacement = this._componentSpace.Displacement;
            var lastComponentSpaceSize = this._componentSpace.Size;

            // se o componente pai for um Panel refaz as validações por mínimos e máximos percentuais
            if (this.FatherIsPanel) {
                // garante que o tamanho máximo percentual seja respeitado
                if (this.Size.MaxIsPercent) {
                    this.ComponentSpace.Size = this._savedComponentDesired;

                    // se o mínimo não for percentual e o tamanho dado está igual ao mínimo
                    // respeita esse tamanho
                    if (this.ComponentSpace.Size != this.ComponentDelimiter.Min || this.Size.MinIsPercent) {
                        var maxSize = this._givedSpace.Size * this.Size.Max / 100;

                        if (this._componentSpace.Size > maxSize) {
                            this.IsNeedMeasureAgain = true;
                            this._componentSpace.Size = maxSize;
                        }
                    }
                }
                else {
                    this._componentSpace.Size = this._componentRequired;
                }

                // garante que o tamanho mínimo percentual seja respeitado
                if (this.Size.MinIsPercent) {
                    var minSize = this._givedSpace.Size * this.Size.Min / 100;

                    if (this._componentSpace.Size < minSize) {
                        this.IsNeedMeasureAgain = true;
                        this._componentSpace.Size = minSize;
                    }
                }
            }
            // se for estrela, o valor informado substitui o desejado
            else if (this.Size.Star > 0) {
                this._componentSpace.Size = this._givedSpace.Size;

                if (this._componentSpace.Size != this._componentRequired) {
                    this.IsNeedMeasureAgain = true;
                }
            }
            // caso contrário o valor desejado é respeitado
            else {
                this._componentSpace.Size = this._componentRequired;
            }

            // se o alinhamento for Streach e não há máximo, sempre utiliza todo o espaço
            if (this.Size.Max == Number.POSITIVE_INFINITY && this.Align == Align.Streach) {
                this._componentSpace.Size = this._givedSpace.Size;

                if (this._componentSpace.Size != this._componentRequired) {
                    this.IsNeedMeasureAgain = true;
                }
            }

            // se tiver scroll nessa dimensão o conteúdo estará sempre visível
            if (this.Scroll == Scroll.None || this._givedSpace.Size > this._componentSpace.Size) {
                // verifica o distanciamento da origem a partir do alinhamento
                switch (this.Align) {
                    case Align.Center:
                        this._componentSpace.Displacement = (this._givedSpace.Size - this._componentSpace.Size) / 2;
                        break;
                    case Align.End:
                        this._componentSpace.Displacement = this._givedSpace.Size - this._componentSpace.Size;
                        break;
                    default:
                        this._componentSpace.Displacement = 0;
                }
            }
            else {
                this._componentSpace.Displacement = 0;
            }

            // tira a margem do tamanho do componente
            this._componentSpace.Size -= this.Margin.Sum();

            // adiciona o distanciamento da origem informado pelo componente pai
            this._componentSpace.Displacement += this._givedSpace.Displacement;

            // atualiza os valores do espaço de conteúdo
            this._contentSpace.Size = this._componentSpace.Size - this.Border.Sum() - this.Padding.Sum();
            // se o scroll estiver visivel tira o tamanho do scroll
            if (this.Scroll == Scroll.Visible) {
                this._contentSpace.Size -= 17;
            }
            this._contentSpace.Displacement = this.Padding.Start;

            // verifica mudança e sinaliza caso houve
            this.IsComponentDisplacementChanged =
                this._componentSpace.Displacement != lastComponentSpaceDisplacement;

            // verifica mudança e sinaliza caso houve
            this.IsComponentSizeChanged =
                this._componentSpace.Size != lastComponentSpaceSize;

            // verifica mudança e sinaliza caso houve
            this.IsComponentSpaceChanged =
                this.IsComponentDisplacementChanged || this.IsComponentSizeChanged;
        }
    }
}
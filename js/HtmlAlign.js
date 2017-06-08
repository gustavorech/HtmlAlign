var HtmlAlign;
(function (HtmlAlign) {
    // Enum para definir sobre qual contexto a propriedade CSS será aplicada
    var CssPropertyContext;
    (function (CssPropertyContext) {
        CssPropertyContext[CssPropertyContext["Component"] = 1] = "Component";
        CssPropertyContext[CssPropertyContext["Child"] = 2] = "Child";
    })(CssPropertyContext = HtmlAlign.CssPropertyContext || (HtmlAlign.CssPropertyContext = {}));
    // Enum para definir os valores de visibilidade possíveis
    var Scroll;
    (function (Scroll) {
        Scroll[Scroll["Auto"] = 1] = "Auto";
        Scroll[Scroll["Visible"] = 2] = "Visible";
        Scroll[Scroll["None"] = 3] = "None";
    })(Scroll = HtmlAlign.Scroll || (HtmlAlign.Scroll = {}));
    // Enum para definir os valores de referência lateral possíveis
    var Side;
    (function (Side) {
        Side[Side["Left"] = 1] = "Left";
        Side[Side["Top"] = 2] = "Top";
        Side[Side["Right"] = 3] = "Right";
        Side[Side["Bottom"] = 4] = "Bottom";
        Side[Side["All"] = 5] = "All";
    })(Side = HtmlAlign.Side || (HtmlAlign.Side = {}));
    // Enum para definir os valores de alinhamento possíveis (por demensão)
    var Align;
    (function (Align) {
        Align[Align["Start"] = 1] = "Start";
        Align[Align["Center"] = 2] = "Center";
        Align[Align["End"] = 3] = "End";
        Align[Align["Streach"] = 4] = "Streach";
    })(Align = HtmlAlign.Align || (HtmlAlign.Align = {}));
    // Enum para definir os eixos possíveis
    var Axis;
    (function (Axis) {
        Axis[Axis["Horizontal"] = 1] = "Horizontal";
        Axis[Axis["Vertical"] = 2] = "Vertical";
    })(Axis = HtmlAlign.Axis || (HtmlAlign.Axis = {}));
    // Enum para os componentes que se adequal ao tamanho
    var Fit;
    (function (Fit) {
        Fit[Fit["Fit"] = 1] = "Fit";
        Fit[Fit["Uniform"] = 2] = "Uniform";
        Fit[Fit["Horizontal"] = 3] = "Horizontal";
        Fit[Fit["Vertical"] = 4] = "Vertical";
    })(Fit = HtmlAlign.Fit || (HtmlAlign.Fit = {}));
})(HtmlAlign || (HtmlAlign = {}));
var HtmlAlign;
(function (HtmlAlign) {
    class Rect {
        constructor(H, V) {
            this.H = H;
            this.V = V;
        }
        static Default() { return new Rect(0, 0); }
        Copy() { return new Rect(this.H, this.V); }
        CopyFrom(obj) {
            this.H = obj.H;
            this.V = obj.V;
        }
        Get(axis) {
            if (axis == HtmlAlign.Axis.Horizontal) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        GetAwry(axis) {
            if (axis == HtmlAlign.Axis.Vertical) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        Set(axis, value) {
            if (axis == HtmlAlign.Axis.Horizontal) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
        SetAwry(axis, value) {
            if (axis == HtmlAlign.Axis.Vertical) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
    }
    HtmlAlign.Rect = Rect;
    // Espaço ocupado por uma dimensão de um retângulo, possui as informações
    // de deslocamente desde a origem e de deslocamento relativo ao componente pai
    // junto a informação do tamanho do retângulo nessa dimensão
    class Space {
        constructor(Displacement, Size) {
            this.Displacement = Displacement;
            this.Size = Size;
        }
        static Default() { return new Space(0, 0); }
        Copy() { return new Space(this.Displacement, this.Size); }
        CopyFrom(obj) {
            this.Displacement = obj.Displacement;
            this.Size = obj.Size;
        }
    }
    HtmlAlign.Space = Space;
    // Grossura de uma linha ou espaço em uma dimensão, tem as informações de grossura
    // no início da dimensão e no fim da dimensão
    class Thickness {
        constructor(Start, End) {
            this.Start = Start;
            this.End = End;
        }
        Copy() { return new Thickness(this.Start, this.End); }
        static Default() { return new Thickness(0, 0); }
        CopyFrom(thickness) {
            this.Start = thickness.Start;
            this.End = thickness.End;
        }
        Sum() {
            return this.Start + this.End;
        }
    }
    HtmlAlign.Thickness = Thickness;
    // Especifica a extensão de tamanhos aceitos pelo componente em uma dimensão
    // se os valores de mínimos e máximos forem iguais indica que o componente tem
    // um tamanho fixo. Também há o valor estrela que indica tamanho proporcional
    class SizeRange {
        constructor(Star, Delimiter, Min, MinIsPercent, Max, MaxIsPercent) {
            this.Star = Star;
            this.Delimiter = Delimiter;
            this.Min = Min;
            this.MinIsPercent = MinIsPercent;
            this.Max = Max;
            this.MaxIsPercent = MaxIsPercent;
            // inverte valores caso necessário, feito apenas na criação
            if (this.MinIsPercent == this.MaxIsPercent
                && this.Min > this.Max) {
                var swap = this.Min;
                this.Min = this.Max;
                this.Max = swap;
            }
        }
        static Default() { return new SizeRange(0, 0, 0, false, Number.POSITIVE_INFINITY, false); }
        Copy() { return new SizeRange(this.Star, this.Delimiter, this.Min, this.MinIsPercent, this.Max, this.MaxIsPercent); }
        CopyFrom(obj) {
            this.Star = obj.Star;
            this.Delimiter = obj.Delimiter;
            this.Min = obj.Min;
            this.MinIsPercent = obj.MinIsPercent;
            this.Max = obj.Max;
            this.MaxIsPercent = obj.MaxIsPercent;
        }
        toString() {
            if (this.Star > 0) {
                return this.Star + "*";
            }
            else if (this.Max == Number.POSITIVE_INFINITY) {
                if (this.Min == 0) {
                    return "~";
                }
                else {
                    return this.Min + "~";
                }
            }
            else if (this.Min == 0) {
                return "~" + this.Max;
            }
            else if (this.Min == this.Max) {
                return this.Min.toString();
            }
            else {
                return this.Min + "~" + this.Max;
            }
        }
    }
    HtmlAlign.SizeRange = SizeRange;
    class SizeDelimiter {
        constructor(Min, Max) {
            this.Min = Min;
            this.Max = Max;
        }
        static Default() { return new SizeDelimiter(0, Number.POSITIVE_INFINITY); }
        Copy() { return new SizeDelimiter(this.Min, this.Max); }
        CopyFrom(obj) {
            this.Min = obj.Min;
            this.Max = obj.Max;
        }
    }
    HtmlAlign.SizeDelimiter = SizeDelimiter;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>
var HtmlAlign;
/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>
(function (HtmlAlign) {
    class Dimension {
        constructor() {
            this.FatherIsPanel = true;
            this.Visible = true;
            this.Scroll = HtmlAlign.Scroll.None;
            this.Align = HtmlAlign.Align.Start;
            this.Size = HtmlAlign.SizeRange.Default();
            this.Margin = HtmlAlign.Thickness.Default();
            this.Border = HtmlAlign.Thickness.Default();
            this.Padding = HtmlAlign.Thickness.Default();
            this.IsComponentDelimiterChanged = false;
            this.IsComponentDesiredChanged = false;
            this.IsNeedMeasureAgain = false;
            this.IsComponentDisplacementChanged = false;
            this.IsComponentSizeChanged = false;
            this.IsComponentSpaceChanged = false;
            this._givedDelimiter = HtmlAlign.SizeDelimiter.Default();
            this._componentDelimiter = HtmlAlign.SizeDelimiter.Default();
            this._contentDelimiter = HtmlAlign.SizeDelimiter.Default();
            this._contentDesired = 0;
            this._componentDesired = 0;
            this._componentRequired = 0;
            this._savedComponentDesired = 0;
            this._givedSpace = HtmlAlign.Space.Default();
            this._componentSpace = HtmlAlign.Space.Default();
            this._contentSpace = HtmlAlign.Space.Default();
        }
        get GivedDelimiter() { return this._givedDelimiter; }
        get ComponentDelimiter() { return this._componentDelimiter; }
        get ContentDelimiter() { return this._contentDelimiter; }
        get ContentDesired() { return this._contentDesired; }
        get ComponentDesired() { return this._componentDesired; }
        get ComponentRequired() { return this._componentRequired; }
        get GivedSpace() { return this._givedSpace; }
        get ComponentSpace() { return this._componentSpace; }
        get ContentSpace() { return this._contentSpace; }
        // [TODO] precisa analisar
        // informa se o tamanho dessa dimensão é fixa
        get IsFixed() {
            return this.Size.MinIsPercent == this.Size.MaxIsPercent
                && this.Size.Star == 0
                && !this.Size.MinIsPercent
                && this.Size.Min == this.Size.Max;
        }
        // [TODO] precisa analisar
        // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
        // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
        // ao componente pai ele precisará ser rearranjado
        get NeedArrange() {
            return this.IsComponentDesiredChanged
                || (this.IsComponentDelimiterChanged
                    && (this.Size.MinIsPercent
                        || this.Size.MaxIsPercent
                        || this.Size.Star > 0
                        || (this.Align == HtmlAlign.Align.Streach && this.Size.Max == Number.POSITIVE_INFINITY)));
        }
        // [TODO] precisa analisar
        get Star() {
            if (!this.Visible) {
                return 0;
            }
            return this.Size.Star;
        }
        // passo 1: behavior informa a delimitação de tamanho
        // componente verifica qual sua delimitação e a do conteúdo
        set GivedDelimiter(value) {
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
            else if (this.Size.Delimiter > 0) {
                this._componentDelimiter.Min = this._givedDelimiter.Max * this.Size.Delimiter / 100;
                if (this._componentDelimiter.Min < this.Size.Min) {
                    this._componentDelimiter.Min = this.Size.Min + this.Margin.Sum();
                }
                else if (this._componentDelimiter.Min > this.Size.Max) {
                    this._componentDelimiter.Min = this.Size.Max + this.Margin.Sum();
                }
                this._componentDelimiter.Max = this._componentDelimiter.Min;
            }
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
                if (!this.Size.MinIsPercent && this.Size.MaxIsPercent
                    && this._componentDelimiter.Max < this._componentDelimiter.Min) {
                    this._componentDelimiter.Max = this._componentDelimiter.Min;
                }
                if (this.Size.MinIsPercent && !this.Size.MaxIsPercent
                    && this._componentDelimiter.Max < this._componentDelimiter.Min) {
                    this._componentDelimiter.Min = this._componentDelimiter.Max;
                }
            }
            // o mínimo tem maior precedência, então se por algum motivo o mínimo for
            // maior que o máximo, substitui o tamanho máximo pelo mínimo
            //if (this._componentDelimiter.Min > this._componentDelimiter.Max) {
            //    this._componentDelimiter.Max = this._componentDelimiter.Min;
            //}
            //// caso especial, o mínimo é percentual e o máximo não é percentual
            //else if (this.Size.MinIsPercent && !this.Size.MaxIsPercent) {
            //    this._componentDelimiter.Min = this._componentDelimiter.Max;
            //}
            // se o alinhamento for Streach e não há máximo, e o delimitador máximo passado
            // pelo componente pai não for infinito, e o tamanho mínimo do componente é menor
            // que o tamanho máximo passado pelo delimitador do componente pai
            // tenta reduzir a probabilidade de um novo measure tornando o delimitador
            // mínimo igual ao máximo do delimitador passado
            // faz isso somente se o componente pai é um panel
            //if (this.FatherIsPanel && this.Size.Star == 0
            //    && this.GivedDelimiter.Max != Number.POSITIVE_INFINITY
            //    && this.Size.Max == Number.POSITIVE_INFINITY && this.Align == Align.Streach
            //    && this._componentDelimiter.Min < this._givedDelimiter.Max) {
            //    this._componentDelimiter.Min = this._givedDelimiter.Max;
            //}
            // verifica qual a delimitação do conteúdo que é a delimitação do componente
            // menos seus espaçamentos e borda
            var totalSpacing = this.Margin.Sum() + this.Border.Sum() + this.Padding.Sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.Scroll == HtmlAlign.Scroll.Visible) {
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
        set ContentDesired(value) {
            // inicialização
            this._contentDesired = value;
            // salva valor antigo para verificar mudança
            var lastComponentDesired = this._componentRequired;
            // o que o componente deseja é o que o seu conteúdo deseja mais
            // seus espaçamentos
            this._componentDesired = this._contentDesired
                + this.Margin.Sum() + this.Border.Sum() + this.Padding.Sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.Scroll == HtmlAlign.Scroll.Visible) {
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
        set GivedSpace(value) {
            // inicialização
            this._givedSpace.CopyFrom(value);
            // salva valores antigos para verificar mudança
            var lastComponentSpaceDisplacement = this._componentSpace.Displacement;
            var lastComponentSpaceSize = this._componentSpace.Size;
            // se for estrela, o valor informado substitui o desejado
            if (this.Size.Star > 0) {
                this._componentSpace.Size = this._givedSpace.Size;
                if (this._componentSpace.Size != this._componentRequired) {
                    this.IsNeedMeasureAgain = true;
                }
            }
            else if (this.Size.Delimiter > 0) {
                this._componentSpace.Size = this._givedSpace.Size * this.Size.Delimiter / 100;
                if (this._componentSpace.Size != this._componentRequired) {
                    this.IsNeedMeasureAgain = true;
                    if (this._componentSpace.Size < this.Size.Min) {
                        this._componentSpace.Size = this.Size.Min;
                    }
                    else if (this._componentSpace.Size > this.Size.Max) {
                        this._componentSpace.Size = this.Size.Max;
                    }
                }
            }
            else if (this.FatherIsPanel) {
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
            else {
                this._componentSpace.Size = this._componentRequired;
            }
            // se o alinhamento for Streach e não há máximo, sempre utiliza todo o espaço
            if (this.Size.Max == Number.POSITIVE_INFINITY && this.Align == HtmlAlign.Align.Streach) {
                this._componentSpace.Size = this._givedSpace.Size;
                if (this._componentSpace.Size != this._componentRequired) {
                    this.IsNeedMeasureAgain = true;
                }
            }
            // se tiver scroll nessa dimensão o conteúdo estará sempre visível
            if (this.Scroll == HtmlAlign.Scroll.None || this._givedSpace.Size > this._componentSpace.Size) {
                // verifica o distanciamento da origem a partir do alinhamento
                switch (this.Align) {
                    case HtmlAlign.Align.Center:
                        this._componentSpace.Displacement = (this._givedSpace.Size - this._componentSpace.Size) / 2;
                        break;
                    case HtmlAlign.Align.End:
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
            if (this.Scroll == HtmlAlign.Scroll.Visible) {
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
    HtmlAlign.Dimension = Dimension;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='Dimension.ts'/>
var HtmlAlign;
/// <reference path='Dimension.ts'/>
(function (HtmlAlign) {
    class Component {
        constructor(Father, Element) {
            this.Father = Father;
            this.Element = Element;
            this._isBehaviorChanged = false;
            this._frozen = false;
            this.H = new HtmlAlign.Dimension();
            this.V = new HtmlAlign.Dimension();
            this.Children = [];
            this.FatherAttached = {};
            // atributos que armazenam modificações dos compnentes
            // para futuro processamento
            this._needMeasure = true;
            this._needRefreshCssProperties = false;
            this._characterDataChanged = false;
            this._needArrange = true;
            this._childNeedArrange = true;
            this._addedElements = [];
            this._removedElements = [];
            this._changedCssProperties = [];
            this._canInformNeedArrangeInMeasure = true;
            // componente lógico
            if (this.Element == undefined) {
                this.Behavior = new HtmlAlign.LogicalBehavior();
                this.Behavior.Component = this;
            }
            else {
                this.Element["component"] = this;
                // informa que o elemento mudará o css quando o mouse estiver sobre ele
                // [TODO] deverá ser modificado no futuro
                if (this.Element.attributes["hover"] != null) {
                    this.Element.addEventListener("mouseover", () => this.NotifyTagChanged());
                    this.Element.addEventListener("mouseout", () => this.NotifyTagChanged());
                }
                // [TODO] deverá ser modificado no futuro
                if (this.Element.style.getPropertyValue("transform")) {
                    this.Element.style.removeProperty("transform");
                    // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
                    this.Element["laststyle"] = this.Element.getAttribute("style");
                }
                // realiza a primeira leitura das propriedades css
                HtmlAlign.Layout.RefreshValuesFromCssProperties(this);
                // precisa inicializar, realiza a leitura dos filhos
                if (this.Behavior.Name != "in" && this.Element.hasChildNodes) {
                    var element = this.Element.firstElementChild;
                    // itera sobre todos os elementos irmãos
                    while (element != null) {
                        if (HtmlAlign.Layout.IsBehavior(element)) {
                            this.Children.push(new Component(this, element));
                        }
                        else if (element.attributes["in"] != null) {
                            this.Children.push(new Component(this, element));
                        }
                        element = element.nextElementSibling;
                    }
                }
            }
            if (this._behavior.OnInit) {
                this._behavior.OnInit();
            }
        }
        get IsContent() {
            return this._isContent;
        }
        get Behavior() {
            return this._behavior;
        }
        set Behavior(value) {
            // [TODO] modificar isso no futuro
            if (!value) {
                if (!this._behavior) {
                    value = new HtmlAlign.PanelBehavior();
                }
                else {
                    return;
                }
            }
            if (this._behavior && this._behavior.Name != value.Name) {
                if (this._behavior.OnDispose) {
                    this._behavior.OnDispose();
                }
                this._isBehaviorChanged = true;
            }
            if (!this._behavior || this._isBehaviorChanged) {
                this._behavior = value;
                this._isLogical = false;
                this._isRoot = false;
                this._isBehavior = false;
                this._isContent = false;
                if (this.Element == undefined) {
                    this._isLogical = true;
                }
                else if (this.Element.tagName == "BODY") {
                    this._isRoot = true;
                }
                else if (this._behavior.Name == "in") {
                    this._isContent = true;
                }
                else {
                    this._isBehavior = true;
                }
            }
            this.H.FatherIsPanel = this.V.FatherIsPanel
                = this.Father.Behavior.Name == "panel" || this.Father.Behavior.Name == "fit";
        }
        get Visible() {
            return this.H.Visible;
        }
        set Visible(value) {
            this.H.Visible = value;
            this.V.Visible = value;
        }
        get HorizontalScroll() {
            return this.H.Scroll;
        }
        get VerticalScroll() {
            return this.V.Scroll;
        }
        set HorizontalScroll(value) {
            this.H.Scroll = value;
        }
        set VerticalScroll(value) {
            this.V.Scroll = value;
        }
        Frozen() {
            this._frozen = true;
        }
        Unfrozen() {
            this._frozen = false;
            this.NotifyTagChanged();
            HtmlAlign.RefreshLayout();
        }
        Get(axis) {
            if (axis == HtmlAlign.Axis.Horizontal) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        GetAwry(axis) {
            if (axis == HtmlAlign.Axis.Vertical) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        Set(axis, value) {
            if (axis == HtmlAlign.Axis.Horizontal) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
        SetAwry(axis, value) {
            if (axis == HtmlAlign.Axis.Vertical) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
        get NeedArrange() {
            return this._needArrange || this._childNeedArrange;
        }
        // notificações para informar que o componente modificou e precisará de
        // uma nova medida. Essa notificação terá que ir até o componente raiz
        NotifyNeedMeasure() {
            // componentes congelados não sofrem alterações
            // cancela o gatilho de aviso de alteração
            if (this._frozen) {
                return;
            }
            if (!this._needMeasure) {
                this._needMeasure = true;
                this.Father.NotifyNeedMeasure();
            }
            else {
                this._needMeasure = true;
            }
        }
        NotifyTagChanged() {
            this._needRefreshCssProperties = true;
            this.NotifyNeedMeasure();
        }
        NotifyAdded(element) {
            // se for um conteúdo, apenas notifica que houve uma modificação
            if (this._isContent) {
                this.NotifyTagChanged();
                return;
            }
            // necessário pois o DOM pode não ter se montado corretamente ainda
            setTimeout(() => {
                // o filho adicionado tem que ser um behavior um um conteúdo
                // e esse componente não pode ser um conteúdo
                if (HtmlAlign.Layout.IsBehavior(element)) {
                    this._addedElements.push(element);
                    HtmlAlign.Log.AddedElements++;
                }
                // se o componente não está visivel deixa pra depois o processamento dos filhos
                if (this.Visible) {
                    this.NotifyNeedMeasure();
                }
            }, 16);
        }
        NotifyRemoved(element) {
            // se for um conteúdo, apenas notifica que houve uma modificação
            if (this._isContent) {
                this.NotifyTagChanged();
                return;
            }
            // o filho adicionado tem que ser um behavior um um conteúdo
            // e esse componente não pode ser um conteúdo
            if (HtmlAlign.Layout.IsBehavior(element)) {
                this._removedElements.push(element);
                HtmlAlign.Log.RemovedElements++;
            }
            // se o componente não está visivel deixa pra depois o processamento dos filhos
            if (this.Visible) {
                this.NotifyNeedMeasure();
            }
        }
        NotifyCssPropertyChanged(cssProperty) {
            this.Element.style.setProperty(cssProperty.Name, cssProperty.GetValueStringFromComponent(this));
            this.NotifyNeedMeasure();
        }
        // notificações para informar que o componente modificou e precisará
        // de um novo arranjo
        NotifyToRefreshArrange() {
            this._needArrange = true;
            this.NotifyArrange();
        }
        NotifyArrange() {
            if (!this._childNeedArrange) {
                this._childNeedArrange = true;
                this.Father.NotifyArrange();
            }
            else {
                this._childNeedArrange = true;
            }
        }
        SetCssPropertyValue(cssProperty) {
            this.Element.style.setProperty(cssProperty.Name, cssProperty.GetValueStringFromComponent(this));
        }
        // Valores do atributo size
        get Width() {
            return {
                width: this.H.Size.Min,
                star: this.H.Size.Star,
                min: this.H.Size.Min,
                max: this.H.Size.Max
            };
        }
        set Width(value) {
            if (typeof value === "number") {
                this.H.Size.Star = 0;
                this.H.Size.Min = value;
                this.H.Size.Max = value;
            }
            else if (typeof value === "object") {
                if (value.star !== undefined) {
                    this.H.Size.Star = value.star;
                }
                else if (value.width !== undefined) {
                    this.H.Size.Star = 0;
                    this.H.Size.Min = value.width;
                    this.H.Size.Max = value.width;
                }
                else {
                    if (value.min !== undefined) {
                        this.H.Size.Star = 0;
                        this.H.Size.Min = value.min;
                    }
                    if (value.max !== undefined) {
                        this.H.Size.Star = 0;
                        this.H.Size.Max = value.max;
                    }
                    if (this.H.Size.Min > this.H.Size.Max) {
                        this.H.Size.Max = this.H.Size.Min;
                    }
                }
                this.NotifyCssPropertyChanged(HtmlAlign.PanelBehavior.SizeCssProperty);
            }
        }
        get Height() {
            return {
                height: this.V.Size.Min,
                star: this.V.Size.Star,
                min: this.V.Size.Min,
                max: this.V.Size.Max
            };
        }
        set Height(value) {
            if (typeof value === "number") {
                this.V.Size.Star = 0;
                this.V.Size.Min = value;
                this.V.Size.Max = value;
            }
            else if (typeof value === "object") {
                if (value.star !== undefined) {
                    this.V.Size.Star = value.star;
                }
                else if (value.height !== undefined) {
                    this.V.Size.Star = 0;
                    this.V.Size.Min = value.height;
                    this.V.Size.Max = value.height;
                }
                else {
                    if (value.min !== undefined) {
                        this.V.Size.Star = 0;
                        this.V.Size.Min = value.min;
                    }
                    if (value.max !== undefined) {
                        this.V.Size.Star = 0;
                        this.V.Size.Max = value.max;
                    }
                    if (this.V.Size.Min > this.V.Size.Max) {
                        this.V.Size.Max = this.V.Size.Min;
                    }
                }
                this.NotifyCssPropertyChanged(HtmlAlign.PanelBehavior.SizeCssProperty);
            }
        }
        PropagateRemovedComponent(component) {
            if (component._behavior.OnDispose) {
                component._behavior.OnDispose();
            }
            component.Element["component"] = undefined;
            for (var index = 0; index < component.Children.length; index++) {
                this.PropagateRemovedComponent(component.Children[index]);
            }
        }
        Measure(h, v) {
            // componentes congelados não sofrem alterações
            if (this._frozen) {
                return;
            }
            // processa a atualização das propriedades css do componente
            if (this._needRefreshCssProperties) {
                this._needRefreshCssProperties = false;
                HtmlAlign.Layout.RefreshValuesFromCssProperties(this);
                // se o behavior modificou durante a leitura será necessário
                // ler novamente as propriedades e notificar os filhos para fazer o mesmo
                if (this._isBehaviorChanged) {
                    this._isBehaviorChanged = false;
                    HtmlAlign.Layout.RefreshValuesFromCssProperties(this);
                    if (this._behavior.OnInit) {
                        this._behavior.OnInit();
                    }
                    for (var index = 0; index < this.Children.length; index++) {
                        this.Children[index].NotifyTagChanged();
                    }
                }
                // necessitará rearranjar os filhos e notificar o pai
                this._needArrange = true;
                this.Father.NotifyToRefreshArrange();
            }
            this.H.GivedDelimiter = h;
            this.V.GivedDelimiter = v;
            // se o elemento não precisa ser medido não precisa fazer nada
            if (!this._needMeasure && !this.H.IsComponentDelimiterChanged
                && !this.V.IsComponentDelimiterChanged) {
                return;
            }
            // processamento de adição e remoção de filhos
            if (this._isBehavior || this._isRoot) {
                // processa a remoção de elementos
                var removedElementsLength = this._removedElements.length;
                if (removedElementsLength > 0) {
                    // varre a lista de elementos removidos
                    for (var index = 0; index < removedElementsLength; index++) {
                        var element = this._removedElements[index];
                        var component = element["component"];
                        if (component != undefined) {
                            var index = this.Children.indexOf(component);
                            if (index > -1) {
                                this.Children.splice(index, 1);
                            }
                            this.PropagateRemovedComponent(component);
                        }
                    } // fecha a iterção pelos elementos removidos
                    // apenas elimina os já processados, pode ser que outros elementos foram
                    // adicionados enquando esse processo ocorria
                    this._removedElements.splice(0, removedElementsLength);
                    // necessitará rearranjar os filhos e notificar o pai
                    this._needArrange = true;
                    this.Father.NotifyToRefreshArrange();
                } // fecha o processo de remoção de elementos
                // processa a adição de elementos
                var addedElementsLength = this._addedElements.length;
                if (addedElementsLength > 0) {
                    // busca o último elemento adicionado e o primeiro para auxiliar
                    var lastElement = this.Element;
                    var firstElement = this.Element;
                    if (this.Children.length > 0) {
                        lastElement = this.Children[this.Children.length - 1].Element;
                        firstElement = this.Children[0].Element;
                    }
                    // varre a lista de elementos adicionados
                    for (var index = 0; index < addedElementsLength; index++) {
                        var element = this._addedElements[index];
                        if (element["component"] != undefined) {
                            continue;
                        }
                        // se o elemento novo será o ultimo da lista apenas adiciona no final
                        if (lastElement.nextElementSibling == element || this.Children.length == 0) {
                            if (HtmlAlign.Layout.IsBehavior(element)) {
                                this.Children.push(new Component(this, element));
                            }
                            // atualiza o último elemento para a próxima iteração
                            lastElement = element;
                        }
                        else if (firstElement.previousElementSibling == element) {
                            if (HtmlAlign.Layout.IsBehavior(element)) {
                                this.Children.splice(0, 0, new Component(this, element));
                            }
                            firstElement = element;
                        }
                        else {
                            // não há mais como garantir o auxílio
                            lastElement = this.Element;
                            firstElement = this.Element;
                            var elementSibling = this.Element.firstElementChild;
                            if (elementSibling.previousElementSibling == element) {
                                if (HtmlAlign.Layout.IsBehavior(element)) {
                                    this.Children.splice(0, 0, new Component(this, element));
                                }
                            }
                            else {
                                var indexComp = 0;
                                // itera desde o primeiro filho procurando pelo elemento
                                // para saber em qual posição dentro os filhos esse elemento vai ocupar
                                // a cada vez que encontrar um componente incrementa um contador
                                while (elementSibling != undefined) {
                                    if (elementSibling["component"] != undefined) {
                                        indexComp++;
                                    }
                                    if (elementSibling.nextElementSibling == element) {
                                        if (HtmlAlign.Layout.IsBehavior(element)) {
                                            this.Children.splice(indexComp, 0, new Component(this, element));
                                        }
                                        break;
                                    }
                                    elementSibling = elementSibling.nextElementSibling;
                                } // fecha o while que percorre todos os filhos
                            } // fecha o if que verifica se é o primeiro elemento
                        } // fecha o if que verifica pelo último elemento
                    } // fecha a iterção pelos elementos adicionados
                    // apenas elimina os já processados, pode ser que outros elementos foram
                    // adicionados enquando esse processo ocorria
                    this._addedElements.splice(0, addedElementsLength);
                    // necessitará rearranjar os filhos e notificar o pai
                    this._needArrange = true;
                    this.Father.NotifyToRefreshArrange();
                } // fecha o processo de adição filhos
            } // fecha a verificação se é do tipo behavior
            // não há porque atualizar componentes sem visibilidade e que não afetam o layout
            if (!this.Visible) {
                return;
            }
            this._behavior.Measure();
            // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
            // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
            // ao componente pai ele precisará ser rearranjado
            if (this._canInformNeedArrangeInMeasure && (this.H.NeedArrange || this.V.NeedArrange)) {
                this._needArrange = true;
                this.Father.NotifyToRefreshArrange();
            }
            this._needMeasure = false;
            HtmlAlign.Log.Measures++;
        }
        Arrange() {
            // não há porque atualizar componentes sem visibilidade e que não afetam o layout
            // componentes congelados não sofrem alterações
            if (!this.Visible || this._frozen) {
                return;
            }
            if (this._needArrange
                || this.H.IsComponentSpaceChanged || this.V.IsComponentSpaceChanged
                || this.H.IsNeedMeasureAgain || this.V.IsNeedMeasureAgain) {
                if (this._isBehavior && (this.H.IsNeedMeasureAgain || this.V.IsNeedMeasureAgain)) {
                    this._canInformNeedArrangeInMeasure = false;
                    this.H.IsNeedMeasureAgain = false;
                    this.V.IsNeedMeasureAgain = false;
                    this.Measure(new HtmlAlign.SizeDelimiter(this.H.GivedSpace.Size, this.H.GivedSpace.Size), new HtmlAlign.SizeDelimiter(this.V.GivedSpace.Size, this.V.GivedSpace.Size));
                    this._canInformNeedArrangeInMeasure = true;
                    HtmlAlign.Log.BehaviorMeasureAgain++;
                }
                this._behavior.Arrange();
                HtmlAlign.Log.BehaviorArranges++;
            }
            else if (this._childNeedArrange) {
                // temporário, precisa melhorar
                if (this._behavior.Name == "fit") {
                    this._behavior.Arrange();
                }
                else {
                    for (var index = 0; index < this.Children.length; index++) {
                        var child = this.Children[index];
                        if (child.NeedArrange) {
                            this.Children[index].Arrange();
                        }
                    }
                }
            }
            // se o espaço determinado para o componente foi modificado ele precisará
            // atualizar o layout
            if (!this._behavior.IsLayoutOverridedInArrange) {
                var width = this.H.ComponentSpace.Size;
                var height = this.V.ComponentSpace.Size;
                if (width < 0) {
                    width = 0;
                }
                if (height < 0) {
                    height = 0;
                }
                this.Element.style.width = width + "px";
                this.Element.style.height = height + "px";
                this.Element.style.left = this.H.ComponentSpace.Displacement + "px";
                this.Element.style.top = this.V.ComponentSpace.Displacement + "px";
                // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
                this.Element["laststyle"] = this.Element.getAttribute("style");
            }
            this._needArrange = false;
            this._childNeedArrange = false;
            HtmlAlign.Log.Arranges++;
        }
    }
    HtmlAlign.Component = Component;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class BehaviorCssProperty {
        constructor() {
            this.regExpString = /^\s*(\w*).*$/;
            this.Name = "--behavior";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "panel";
        }
        SetValueFromCssProperty(valueString, component) {
            component.Behavior = HtmlAlign.Layout.GetBehavior(component, this.regExpString.exec(valueString)[1]);
            if (component.Behavior != null) {
                component.Behavior.Component = component;
            }
        }
        GetValueStringFromComponent(component) {
            return HtmlAlign.Layout.GetBehaviorName(component);
        }
    }
    HtmlAlign.BehaviorCssProperty = BehaviorCssProperty;
    class AlignCssProperty {
        constructor() {
            this.regExpAlign = /^\s*(left|right|top|bottom|center|streach){0,1}\s*(left|right|top|bottom|center|streach){0,1}.*$/;
            this.Name = "--align";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "streach";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchsAlign = this.regExpAlign.exec(valueString);
            var horizontal = matchsAlign[1];
            var vertical = matchsAlign[2];
            component.H.Align = HtmlAlign.Align.Streach;
            component.V.Align = HtmlAlign.Align.Streach;
            var nextAxis = this.ReadAlign(HtmlAlign.Axis.Horizontal, horizontal, component);
            if (vertical == null) {
                if (horizontal == "streach" || horizontal == "center") {
                    this.ReadAlign(nextAxis, horizontal, component);
                }
            }
            else {
                this.ReadAlign(nextAxis, vertical, component);
            }
        }
        ReadAlign(axis, valueString, component) {
            if (valueString == "left") {
                if (axis == HtmlAlign.Axis.Vertical) {
                    component.V.Align = component.H.Align;
                }
                component.H.Align = HtmlAlign.Align.Start;
                return HtmlAlign.Axis.Vertical;
            }
            else if (valueString == "right") {
                if (axis == HtmlAlign.Axis.Vertical) {
                    component.V.Align = component.H.Align;
                }
                component.H.Align = HtmlAlign.Align.End;
                return HtmlAlign.Axis.Vertical;
            }
            else if (valueString == "top") {
                component.V.Align = HtmlAlign.Align.Start;
                return HtmlAlign.Axis.Horizontal;
            }
            else if (valueString == "bottom") {
                component.V.Align = HtmlAlign.Align.End;
                return HtmlAlign.Axis.Horizontal;
            }
            else if (valueString == "center") {
                component.Get(axis).Align = HtmlAlign.Align.Center;
                return HtmlAlign.Axis.Vertical;
            }
            else {
                component.Get(axis).Align = HtmlAlign.Align.Streach;
                return HtmlAlign.Axis.Vertical;
            }
        }
        GetValueStringFromComponent(component) {
            var horizontal = "left";
            var vertical = "top";
            if (component.H.Align == HtmlAlign.Align.End) {
                horizontal = "right";
            }
            else if (component.H.Align == HtmlAlign.Align.Center) {
                horizontal = "center";
            }
            else if (component.H.Align == HtmlAlign.Align.Streach) {
                horizontal = "streach";
            }
            if (component.V.Align == HtmlAlign.Align.End) {
                horizontal = "bottom";
            }
            else if (component.V.Align == HtmlAlign.Align.Center) {
                horizontal = "center";
            }
            else if (component.V.Align == HtmlAlign.Align.Streach) {
                horizontal = "streach";
            }
            if (horizontal == vertical) {
                return horizontal;
            }
            return horizontal + " " + vertical;
        }
    }
    HtmlAlign.AlignCssProperty = AlignCssProperty;
    class SizeCssProperty {
        constructor() {
            this.regExpSize = /^\s*(\d*[.]?\d*)([%]([\[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?)(?:\s+(\d*[.]?\d*)([%]([\[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?))?.*$/;
            this.Default = HtmlAlign.SizeRange.Default();
            this.Name = "--size";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "~";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchsSize = this.regExpSize.exec(valueString);
            component.H.Size =
                this.ReadSizeRange(matchsSize[1], matchsSize[2], matchsSize[4], matchsSize[5], matchsSize[6], matchsSize[7], matchsSize[8], this.Default);
            component.V.Size =
                this.ReadSizeRange(matchsSize[9], matchsSize[10], matchsSize[12], matchsSize[13], matchsSize[14], matchsSize[15], matchsSize[16], component.H.Size);
        }
        GetValueStringFromComponent(component) {
            return component.H.Size.toString() + " " + component.V.Size.toString();
        }
        ReadSizeRange(min, minPercentDesc, minPercentValue, maxPercentValue, type, max, maxPercent, def) {
            if (minPercentDesc && minPercentDesc.length > 1) {
                return new HtmlAlign.SizeRange(0, parseFloat(min) || 100, parseFloat(minPercentValue) || 0, false, parseFloat(maxPercentValue) || Number.POSITIVE_INFINITY, false);
            }
            var minIsPercent = minPercentDesc == "%";
            var maxIsPercent = maxPercent == "%";
            if (!type && !min && min != "0") {
                return new HtmlAlign.SizeRange(def.Star, 0, def.Min, def.MinIsPercent, def.Max, def.MaxIsPercent);
            }
            else if (type == "~") {
                return new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
            }
            else if (type == "*") {
                return new HtmlAlign.SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
            }
            else if (min == "0") {
                return new HtmlAlign.SizeRange(0, 0, 0, false, 0, false);
            }
            else {
                return new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(min) || Number.POSITIVE_INFINITY, minIsPercent);
            }
        }
    }
    HtmlAlign.SizeCssProperty = SizeCssProperty;
    class CascadeUpdateCssProperty {
        constructor() {
            this.cascadeExpAlign = /^\s*(none|all|\d*).*$/;
            this.Name = "--cascade";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "none";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchsCascade = this.cascadeExpAlign.exec(valueString);
            var cascade = matchsCascade[1];
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
        GetValueStringFromComponent(component) {
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
    HtmlAlign.CascadeUpdateCssProperty = CascadeUpdateCssProperty;
    class HoverCssProperty {
        constructor() {
            this.hoverExpAlign = /^\s*(none|refresh).*$/;
            this.Name = "--hover";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "none";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchsHover = this.hoverExpAlign.exec(valueString);
            var hover = matchsHover[1];
            if (!hover || hover == "none") {
                component.UpdateOnHover = false;
            }
            else {
                component.UpdateOnHover = true;
            }
        }
        GetValueStringFromComponent(component) {
            if (!component.UpdateOnHover) {
                return "none";
            }
            else {
                return "update";
            }
        }
    }
    HtmlAlign.HoverCssProperty = HoverCssProperty;
    class DisplayCssProperty {
        constructor() {
            this.Name = "display";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "block";
        }
        SetValueFromCssProperty(valueString, component) {
            if (valueString.startsWith("none")) {
                component.Visible = false;
            }
            else {
                component.Visible = true;
            }
        }
        GetValueStringFromComponent(component) {
            if (component.Visible) {
                return "block";
            }
            else {
                return "none";
            }
        }
    }
    HtmlAlign.DisplayCssProperty = DisplayCssProperty;
    class ScrollCssProperty {
        constructor() {
            this.regExpScroll = /^\s*(auto|overlay|hidden|scroll|visible){0,1}\s*(auto|overlay|hidden|scroll|visible){0,1}.*$/;
            this.Name = "overflow";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "hidden";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchsAlign = this.regExpScroll.exec(valueString);
            var horizontal = matchsAlign[1];
            var vertical = matchsAlign[2] || horizontal;
            if (horizontal == "auto" || horizontal == "overlay") {
                component.HorizontalScroll = HtmlAlign.Scroll.Auto;
            }
            else if (horizontal == "scroll") {
                component.HorizontalScroll = HtmlAlign.Scroll.Visible;
            }
            else {
                component.HorizontalScroll = HtmlAlign.Scroll.None;
            }
            if (vertical == "auto" || vertical == "overlay") {
                component.VerticalScroll = HtmlAlign.Scroll.Auto;
            }
            else if (vertical == "scroll") {
                component.VerticalScroll = HtmlAlign.Scroll.Visible;
            }
            else {
                component.VerticalScroll = HtmlAlign.Scroll.None;
            }
        }
        GetValueStringFromComponent(component) {
            if (component.Visible) {
                return "block";
            }
            else {
                return "none";
            }
        }
    }
    HtmlAlign.ScrollCssProperty = ScrollCssProperty;
    class MarginLeftCssProperty {
        constructor() {
            this.Name = "margin-left";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Margin.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Margin.Start.toString() + "px";
        }
    }
    HtmlAlign.MarginLeftCssProperty = MarginLeftCssProperty;
    class MarginTopCssProperty {
        constructor() {
            this.Name = "margin-top";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Margin.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Margin.Start.toString() + "px";
        }
    }
    HtmlAlign.MarginTopCssProperty = MarginTopCssProperty;
    class MarginRightCssProperty {
        constructor() {
            this.Name = "margin-right";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Margin.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Margin.End.toString() + "px";
        }
    }
    HtmlAlign.MarginRightCssProperty = MarginRightCssProperty;
    class MarginBottomCssProperty {
        constructor() {
            this.Name = "margin-bottom";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Margin.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Margin.End.toString() + "px";
        }
    }
    HtmlAlign.MarginBottomCssProperty = MarginBottomCssProperty;
    class BorderLeftCssProperty {
        constructor() {
            this.Name = "border-left-width";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Border.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Border.Start.toString() + "px";
        }
    }
    HtmlAlign.BorderLeftCssProperty = BorderLeftCssProperty;
    class BorderTopCssProperty {
        constructor() {
            this.Name = "border-top-width";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Border.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Border.Start.toString() + "px";
        }
    }
    HtmlAlign.BorderTopCssProperty = BorderTopCssProperty;
    class BorderRightCssProperty {
        constructor() {
            this.Name = "border-right-width";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Border.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Border.End.toString() + "px";
        }
    }
    HtmlAlign.BorderRightCssProperty = BorderRightCssProperty;
    class BorderBottomCssProperty {
        constructor() {
            this.Name = "border-bottom-width";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Border.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Border.End.toString() + "px";
        }
    }
    HtmlAlign.BorderBottomCssProperty = BorderBottomCssProperty;
    class PaddingLeftCssProperty {
        constructor() {
            this.Name = "padding-left";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Padding.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Padding.Start.toString() + "px";
        }
    }
    HtmlAlign.PaddingLeftCssProperty = PaddingLeftCssProperty;
    class PaddingTopCssProperty {
        constructor() {
            this.Name = "padding-top";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Padding.Start = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Padding.Start.toString() + "px";
        }
    }
    HtmlAlign.PaddingTopCssProperty = PaddingTopCssProperty;
    class PaddingRightCssProperty {
        constructor() {
            this.Name = "padding-right";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.H.Padding.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.H.Padding.End.toString() + "px";
        }
    }
    HtmlAlign.PaddingRightCssProperty = PaddingRightCssProperty;
    class PaddingBottomCssProperty {
        constructor() {
            this.Name = "padding-bottom";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return null;
        }
        SetValueFromCssProperty(valueString, component) {
            component.V.Padding.End = Number.parseInt(valueString);
        }
        GetValueStringFromComponent(component) {
            return component.V.Padding.End.toString() + "px";
        }
    }
    HtmlAlign.PaddingBottomCssProperty = PaddingBottomCssProperty;
    class PanelBehavior {
        constructor() {
            this.Name = "panel";
            this.IsLayoutOverridedInArrange = false;
        }
        GetNew() {
            return new PanelBehavior();
        }
        GetCssProperties() {
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
        Measure() {
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
        Arrange() {
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.H.GivedSpace = this.Component.H.ContentSpace;
                child.V.GivedSpace = this.Component.V.ContentSpace;
                child.Arrange();
            }
        }
    }
    PanelBehavior.BehaviorCssProperty = new BehaviorCssProperty();
    PanelBehavior.AlignCssProperty = new AlignCssProperty();
    PanelBehavior.SizeCssProperty = new SizeCssProperty();
    PanelBehavior.DisplayCssProperty = new DisplayCssProperty();
    PanelBehavior.ScrollCssProperty = new ScrollCssProperty();
    PanelBehavior.MarginLeftCssProperty = new MarginLeftCssProperty();
    PanelBehavior.MarginTopCssProperty = new MarginTopCssProperty();
    PanelBehavior.MarginRightCssProperty = new MarginRightCssProperty();
    PanelBehavior.MarginBottomCssProperty = new MarginBottomCssProperty();
    PanelBehavior.BorderLeftCssProperty = new BorderLeftCssProperty();
    PanelBehavior.BorderTopCssProperty = new BorderTopCssProperty();
    PanelBehavior.BorderRightCssProperty = new BorderRightCssProperty();
    PanelBehavior.BorderBottomCssProperty = new BorderBottomCssProperty();
    PanelBehavior.PaddingLeftCssProperty = new PaddingLeftCssProperty();
    PanelBehavior.PaddingTopCssProperty = new PaddingTopCssProperty();
    PanelBehavior.PaddingRightCssProperty = new PaddingRightCssProperty();
    PanelBehavior.PaddingBottomCssProperty = new PaddingBottomCssProperty();
    HtmlAlign.PanelBehavior = PanelBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class InBehavior {
        constructor() {
            this.Name = "in";
            this.IsLayoutOverridedInArrange = true;
            this._widthIsMaxContent = false;
            this._heightIsMaxContent = false;
            this._needInformLastStyle = false;
        }
        GetNew() {
            return new InBehavior();
        }
        GetCssProperties() {
            return [];
        }
        Measure() {
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
                    this.Component.Element.style.width = HtmlAlign.Layout.MaxContentString;
                    this._needInformLastStyle = true;
                }
                if (!this._heightIsMaxContent) {
                    this._heightIsMaxContent = true;
                    this.Component.Element.style.height = HtmlAlign.Layout.MaxContentString;
                    this._needInformLastStyle = true;
                }
                var maxHorizontal = this.Component.H.GivedDelimiter.Max - this.Component.H.Margin.Sum();
                // maior ou igual porque o clientWidth só informa a parte inteira do número
                if (this.Component.Element.clientWidth >= maxHorizontal) {
                    this.Component.Element.style.width = maxHorizontal + "px";
                    this._widthIsMaxContent = false;
                    if (!this._heightIsMaxContent) {
                        this._heightIsMaxContent = true;
                        this.Component.Element.style.height = HtmlAlign.Layout.MaxContentString;
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
        Arrange() {
            if (this.Component.H.ComponentDesired != this.Component.H.GivedSpace.Size) {
                this.Component.H.GivedDelimiter = new HtmlAlign.SizeDelimiter(this.Component.H.GivedSpace.Size, this.Component.H.GivedSpace.Size);
                this.Component.V.GivedDelimiter = new HtmlAlign.SizeDelimiter(this.Component.V.GivedSpace.Size, this.Component.V.GivedSpace.Size);
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
    HtmlAlign.InBehavior = InBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class LogicalBehavior extends HtmlAlign.PanelBehavior {
        constructor() {
            super(...arguments);
            this.IsLayoutOverridedInArrange = true;
        }
        // para o arrange repassa integralmente o que o componente pai lhe passou
        Arrange() {
            if (this.Component.H.IsNeedMeasureAgain || this.Component.V.IsNeedMeasureAgain) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.IsNeedMeasureAgain = false;
                this.Component.V.IsNeedMeasureAgain = false;
                // nos componentes lógicos apenas o tamanho da dimensão estrela pode ser modificado
                var horizontalSize;
                var verticalSize;
                if (this.Component.H.Star > 0) {
                    horizontalSize = new HtmlAlign.SizeDelimiter(this.Component.H.GivedSpace.Size, this.Component.H.GivedSpace.Size);
                }
                else {
                    horizontalSize = this.Component.H.GivedDelimiter;
                }
                if (this.Component.V.Star > 0) {
                    verticalSize = new HtmlAlign.SizeDelimiter(this.Component.V.GivedSpace.Size, this.Component.V.GivedSpace.Size);
                }
                else {
                    verticalSize = this.Component.V.GivedDelimiter;
                }
                this.Component.Measure(horizontalSize, verticalSize);
                HtmlAlign.Log.LogicalMeasureAgain++;
            }
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.H.GivedSpace = this.Component.H.GivedSpace;
                child.V.GivedSpace = this.Component.V.GivedSpace;
                child.Arrange();
            }
        }
    }
    HtmlAlign.LogicalBehavior = LogicalBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class BodyBehavior extends HtmlAlign.PanelBehavior {
        constructor() {
            super(...arguments);
            this.IsLayoutOverridedInArrange = false;
        }
        // a medição desse comportamento é diferente, se forem componentes com máximos
        // percentuais respeita o tamanho da tela
        // se não permite que o componente cresça indefinidamente
        Measure() {
            var fixedHDelimiter = new HtmlAlign.SizeDelimiter(this.Component.H.Size.Min, this.Component.H.Size.Min);
            var fixedVDelimiter = new HtmlAlign.SizeDelimiter(this.Component.V.Size.Min, this.Component.V.Size.Min);
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
        Arrange() {
            var needScrollVertical = false;
            var needScrollHorizontal = false;
            if (this.Component.V.Scroll == HtmlAlign.Scroll.Auto) {
                var sizeVDesired = this.Component.V.ContentDesired + this.Component.V.Margin.Sum()
                    + this.Component.V.Border.Sum() + this.Component.V.Padding.Sum();
                if (sizeVDesired > this.Component.V.Size.Min) {
                    needScrollVertical = true;
                }
            }
            if (this.Component.H.Scroll == HtmlAlign.Scroll.Auto) {
                var sizeHDesired = this.Component.H.ContentDesired + this.Component.H.Margin.Sum()
                    + this.Component.H.Border.Sum() + this.Component.H.Padding.Sum();
                if (sizeHDesired > this.Component.H.Size.Min) {
                    needScrollHorizontal = true;
                }
            }
            if (needScrollVertical && !needScrollHorizontal) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.Size.Min -= 17;
                this.Component.Measure(HtmlAlign.SizeDelimiter.Default(), HtmlAlign.SizeDelimiter.Default());
                this.Component.H.GivedSpace = new HtmlAlign.Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new HtmlAlign.Space(0, this.Component.V.ComponentRequired);
                this.Component.H.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            else if (needScrollHorizontal && !needScrollVertical) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.V.Size.Min -= 17;
                this.Component.Measure(HtmlAlign.SizeDelimiter.Default(), HtmlAlign.SizeDelimiter.Default());
                this.Component.H.GivedSpace = new HtmlAlign.Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new HtmlAlign.Space(0, this.Component.V.ComponentRequired);
                this.Component.V.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            else if (needScrollVertical && needScrollVertical) {
                this.Component._canInformNeedArrangeInMeasure = false;
                this.Component.H.Size.Min -= 17;
                this.Component.V.Size.Min -= 17;
                this.Component.Measure(HtmlAlign.SizeDelimiter.Default(), HtmlAlign.SizeDelimiter.Default());
                this.Component.H.GivedSpace = new HtmlAlign.Space(0, this.Component.H.ComponentRequired);
                this.Component.V.GivedSpace = new HtmlAlign.Space(0, this.Component.V.ComponentRequired);
                this.Component.H.Size.Min += 17;
                this.Component.V.Size.Min += 17;
                this.Component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            super.Arrange();
        }
    }
    HtmlAlign.BodyBehavior = BodyBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class StackCssProperty {
        constructor() {
            this.regExpString = /^\s*(\w*).*$/;
            this.Name = "--stack";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "left";
        }
        SetValueFromCssProperty(valueString, component) {
            var valueString = this.regExpString.exec(valueString)[1];
            var stackBehavior = component.Behavior;
            if (valueString == "top")
                stackBehavior.Side = HtmlAlign.Side.Top;
            else if (valueString == "right")
                stackBehavior.Side = HtmlAlign.Side.Right;
            else if (valueString == "bottom")
                stackBehavior.Side = HtmlAlign.Side.Bottom;
            else
                stackBehavior.Side = HtmlAlign.Side.Left;
        }
        GetValueStringFromComponent(component) {
            var stackBehavior = component.Behavior;
            if (stackBehavior.Side == HtmlAlign.Side.Top)
                return "top";
            else if (stackBehavior.Side == HtmlAlign.Side.Right)
                return "right";
            else if (stackBehavior.Side == HtmlAlign.Side.Bottom)
                return "bottom";
            else
                return "left";
        }
    }
    HtmlAlign.StackCssProperty = StackCssProperty;
    class StackBehavior {
        constructor() {
            this.Name = "stack";
            this.IsLayoutOverridedInArrange = false;
            this._totalDesiredSizeNotStarInAxis = 0;
            this._starCountInAxis = 0;
        }
        GetNew() {
            return new StackBehavior();
        }
        GetCssProperties() {
            return [StackBehavior.StackCssProperty];
        }
        Measure() {
            var axis = HtmlAlign.Axis.Vertical;
            if (this.Side == HtmlAlign.Side.Left || this.Side == HtmlAlign.Side.Right) {
                axis = HtmlAlign.Axis.Horizontal;
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
        Arrange() {
            var axis = HtmlAlign.Axis.Vertical;
            if (this.Side == HtmlAlign.Side.Left || this.Side == HtmlAlign.Side.Right) {
                axis = HtmlAlign.Axis.Horizontal;
            }
            var spaceInAxis = this.Component.Get(axis).ContentSpace.Copy();
            var spacePerpendicularOfAxis = this.Component.GetAwry(axis).ContentSpace;
            var starPortionSize = 0;
            if (this._starCountInAxis > 0 && spaceInAxis.Size > this._totalDesiredSizeNotStarInAxis) {
                starPortionSize = (spaceInAxis.Size - this._totalDesiredSizeNotStarInAxis) / this._starCountInAxis;
            }
            if (this.Side == HtmlAlign.Side.Left || this.Side == HtmlAlign.Side.Top) {
                for (var index = 0; index < this.Component.Children.length; index++) {
                    var child = this.Component.Children[index];
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
                    var child = this.Component.Children[index];
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
    StackBehavior.StackCssProperty = new StackCssProperty();
    HtmlAlign.StackBehavior = StackBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class WrapCssProperty {
        constructor() {
            this.regExpString = /^\s*(\w*).*$/;
            this.Name = "--wrap";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "left";
        }
        SetValueFromCssProperty(valueString, component) {
            var valueString = this.regExpString.exec(valueString)[1];
            var wrapBehavior = component.Behavior;
            if (valueString == "top")
                wrapBehavior._side = HtmlAlign.Side.Top;
            else if (valueString == "right")
                wrapBehavior._side = HtmlAlign.Side.Right;
            else if (valueString == "bottom")
                wrapBehavior._side = HtmlAlign.Side.Bottom;
            else
                wrapBehavior._side = HtmlAlign.Side.Left;
        }
        GetValueStringFromComponent(component) {
            var wrapBehavior = component.Behavior;
            if (wrapBehavior._side == HtmlAlign.Side.Top)
                return "top";
            else if (wrapBehavior._side == HtmlAlign.Side.Right)
                return "right";
            else if (wrapBehavior._side == HtmlAlign.Side.Bottom)
                return "bottom";
            else
                return "left";
        }
    }
    HtmlAlign.WrapCssProperty = WrapCssProperty;
    class WrapBehavior {
        constructor() {
            this.Name = "wrap";
            this.IsLayoutOverridedInArrange = false;
            this._lines = [];
        }
        GetNew() {
            return new WrapBehavior();
        }
        GetCssProperties() {
            return [WrapBehavior.WrapCssProperty];
        }
        Measure() {
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
        Arrange() {
            var spaceInAxis = this.Component.Get(this._wrapAxis).ContentSpace.Copy();
            var spaceInReverseAxis = this.Component.GetAwry(this._wrapAxis).ContentSpace.Copy();
            var spaceInAxisCopy = spaceInAxis.Copy();
            for (var lineIndex = 0; lineIndex < this._lines.length; lineIndex++) {
                var line = this._lines[lineIndex];
                spaceInReverseAxis.Size = line.MaxSizeInReverseAxis;
                for (var index = 0; index < line.Components.length; index++) {
                    var child = line.Components[index];
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
        ProcessLines(horizontalMax, verticalMax) {
            this._lines = [];
            this._wrapAxis = HtmlAlign.Axis.Vertical;
            var maxSizeInAxis = verticalMax;
            if (this._side == HtmlAlign.Side.Left || this._side == HtmlAlign.Side.Right) {
                this._wrapAxis = HtmlAlign.Axis.Horizontal;
                maxSizeInAxis = horizontalMax;
            }
            var currentLine = null;
            if (this._side == HtmlAlign.Side.Left || this._side == HtmlAlign.Side.Top) {
                for (var index = 0; index < this.Component.Children.length; index++) {
                    var child = this.Component.Children[index];
                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
            else {
                for (var index = this.Component.Children.length - 1; index >= 0; index--) {
                    var child = this.Component.Children[index];
                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
        }
    }
    WrapBehavior.WrapCssProperty = new WrapCssProperty();
    HtmlAlign.WrapBehavior = WrapBehavior;
    class WrapLine {
        constructor(WrapAxis, MaxSizeInAxis, component) {
            this.WrapAxis = WrapAxis;
            this.MaxSizeInAxis = MaxSizeInAxis;
            // Se é o primeiro elemento da linha não importa o tamanho dele, ele ficará nessa linha            
            this.SumOfSizesInAxis = component.Get(this.WrapAxis).ComponentRequired;
            this.MaxSizeInReverseAxis = component.GetAwry(this.WrapAxis).ComponentRequired;
            this.Components = [];
            this.Components.push(component);
        }
        Add(component) {
            var sizeInAxis = component.Get(this.WrapAxis).ComponentRequired;
            var sizeInReverseAxis = component.GetAwry(this.WrapAxis).ComponentRequired;
            // Se a adição do componente a essa linha faz com que o tamanho extrapole
            // o tamanho máximo esse componente não será inserido nessa linha
            if ((this.SumOfSizesInAxis + sizeInAxis) > this.MaxSizeInAxis) {
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
    HtmlAlign.WrapLine = WrapLine;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class DockCssProperty {
        constructor() {
            this.regExpString = /^\s*(\w*).*$/;
            this.Name = "--dock";
            this.Context = HtmlAlign.CssPropertyContext.Child;
        }
        DefaultValue() {
            return "left";
        }
        SetValueFromCssProperty(valueString, component) {
            var valueString = this.regExpString.exec(valueString)[1];
            if (valueString == "top")
                component.FatherAttached["Side"] = HtmlAlign.Side.Top;
            else if (valueString == "right")
                component.FatherAttached["Side"] = HtmlAlign.Side.Right;
            else if (valueString == "bottom")
                component.FatherAttached["Side"] = HtmlAlign.Side.Bottom;
            else if (valueString == "left")
                component.FatherAttached["Side"] = HtmlAlign.Side.Left;
            else
                component.FatherAttached["Side"] = HtmlAlign.Side.All;
        }
        GetValueStringFromComponent(component) {
            if (component.FatherAttached["Side"] == HtmlAlign.Side.Top)
                return "top";
            else if (component.FatherAttached["Side"] == HtmlAlign.Side.Right)
                return "right";
            else if (component.FatherAttached["Side"] == HtmlAlign.Side.Bottom)
                return "bottom";
            else if (component.FatherAttached["Side"] == HtmlAlign.Side.Left)
                return "left";
            else
                return "fit";
        }
    }
    HtmlAlign.DockCssProperty = DockCssProperty;
    class DockBehavior {
        constructor() {
            this.Name = "dock";
            this.IsLayoutOverridedInArrange = false;
        }
        GetNew() {
            return new DockBehavior();
        }
        GetCssProperties() {
            return [DockBehavior.DockCssPropery];
        }
        Measure() {
            var totalSumRect = HtmlAlign.Rect.Default();
            var desiredRect = HtmlAlign.Rect.Default();
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                child.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);
                var axis = HtmlAlign.Axis.Vertical;
                if (child.FatherAttached["Side"] == HtmlAlign.Side.Left
                    || child.FatherAttached["Side"] == HtmlAlign.Side.Right) {
                    axis = HtmlAlign.Axis.Horizontal;
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
                if (child.FatherAttached["Side"] == HtmlAlign.Side.All) {
                    break;
                }
            }
            this.Component.H.ContentDesired = desiredRect.H;
            this.Component.V.ContentDesired = desiredRect.V;
        }
        Arrange() {
            var sizeRect = new HtmlAlign.Rect(this.Component.H.ContentSpace.Size, this.Component.V.ContentSpace.Size);
            var displacementRect = new HtmlAlign.Rect(this.Component.H.ContentSpace.Displacement, this.Component.V.ContentSpace.Displacement);
            var clearNext = false;
            for (var index = 0; index < this.Component.Children.length; index++) {
                var child = this.Component.Children[index];
                if (clearNext) {
                    child.H.GivedSpace = HtmlAlign.Space.Default();
                    child.V.GivedSpace = HtmlAlign.Space.Default();
                    child.Arrange();
                    continue;
                }
                if (child.FatherAttached["Side"] == HtmlAlign.Side.All) {
                    child.H.GivedSpace = new HtmlAlign.Space(displacementRect.H, sizeRect.H);
                    child.V.GivedSpace = new HtmlAlign.Space(displacementRect.V, sizeRect.V);
                    child.Arrange();
                    clearNext = true;
                    continue;
                }
                var axis = HtmlAlign.Axis.Vertical;
                if (child.FatherAttached["Side"] == HtmlAlign.Side.Left
                    || child.FatherAttached["Side"] == HtmlAlign.Side.Right) {
                    axis = HtmlAlign.Axis.Horizontal;
                }
                var sizeInAxis = child.Get(axis).ComponentRequired;
                if (sizeInAxis >= sizeRect.Get(axis)) {
                    sizeInAxis = sizeRect.Get(axis);
                    clearNext = true;
                }
                if (!clearNext && (child.FatherAttached["Side"] == HtmlAlign.Side.Right
                    || child.FatherAttached["Side"] == HtmlAlign.Side.Bottom)) {
                    child.Get(axis).GivedSpace = new HtmlAlign.Space(displacementRect.Get(axis)
                        + sizeRect.Get(axis) - sizeInAxis, sizeInAxis);
                }
                else {
                    child.Get(axis).GivedSpace = new HtmlAlign.Space(displacementRect.Get(axis), sizeInAxis);
                    displacementRect.Set(axis, displacementRect.Get(axis) + sizeInAxis);
                }
                child.GetAwry(axis).GivedSpace = new HtmlAlign.Space(displacementRect.GetAwry(axis), sizeRect.GetAwry(axis));
                sizeRect.Set(axis, sizeRect.Get(axis) - sizeInAxis);
                child.Arrange();
            }
        }
    }
    DockBehavior.DockCssPropery = new DockCssProperty();
    HtmlAlign.DockBehavior = DockBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
var HtmlAlign;
/// <reference path='../Component.ts'/>
(function (HtmlAlign) {
    class GridCssProperty {
        constructor() {
            this.Name = "--grid";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "*, *";
        }
        SetValueFromCssProperty(valueString, component) {
            var regexValidateGrid = /^(\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+\s*[,](\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+.*$/;
            var regexGrid = /\s*((\d*[.]?\d*)([%]?)([~*])(\d*[.]?\d*)([%]?))|(\d+[.]?\d*)([%]?)|([,])/g;
            var gridBehavior = component.Behavior;
            // verfica se a string está bem formada, se não estiver deixa os valores padrões e retorna
            if (!regexValidateGrid.test(valueString)) {
                gridBehavior.Columns = [HtmlAlign.SizeRange.Default()];
                gridBehavior.Rows = [HtmlAlign.SizeRange.Default()];
                return;
            }
            gridBehavior.Columns = [];
            gridBehavior.Rows = [];
            var matchs;
            var rows = false;
            while (matchs = regexGrid.exec(valueString)) {
                // verifica se modificou as declarações de colunas para linhas
                if (matchs[9] == ",") {
                    // indica que tinha mais de uma , então para a leitura
                    if (rows) {
                        break;
                    }
                    rows = true;
                    continue;
                }
                var sizeRange;
                // se tem um valor único e não um espaço de values
                if (matchs[7] != undefined) {
                    var value = parseInt(matchs[7]);
                    var isPercent = matchs[8] == "%";
                    sizeRange = new HtmlAlign.SizeRange(0, 0, value, isPercent, value, isPercent);
                }
                else {
                    var min = matchs[2];
                    var minIsPercent = matchs[3];
                    var type = matchs[4];
                    var max = matchs[5];
                    var maxIsPercent = matchs[6];
                    if (!type && !min && min != "0") {
                        sizeRange = HtmlAlign.SizeRange.Default();
                    }
                    else if (type == "~") {
                        sizeRange = new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
                    }
                    else if (type == "*") {
                        sizeRange = new HtmlAlign.SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
                    }
                    else if (min == "0") {
                        sizeRange = new HtmlAlign.SizeRange(0, 0, 0, false, 0, false);
                    }
                    else {
                        sizeRange = new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(min) || Number.POSITIVE_INFINITY, minIsPercent);
                    }
                }
                // verifica se adicionará nas colunas ou na linhas
                if (rows) {
                    gridBehavior.Rows.push(sizeRange);
                }
                else {
                    gridBehavior.Columns.push(sizeRange);
                }
            }
            // se não tem colunas colca o valor default
            if (gridBehavior.Columns.length == 0) {
                gridBehavior.Columns = [HtmlAlign.SizeRange.Default()];
            }
            // se não tem linhas colca o valor default
            if (gridBehavior.Rows.length == 0) {
                gridBehavior.Rows = [HtmlAlign.SizeRange.Default()];
            }
        }
        GetValueStringFromComponent(component) {
            var gridBehavior = component.Behavior;
            var valueString = "";
            for (var index = 0; index < gridBehavior.Columns.length; index++) {
                valueString += " " + gridBehavior.Columns[index].toString();
            }
            valueString += ",";
            for (var index = 0; index < gridBehavior.Rows.length; index++) {
                valueString += " " + gridBehavior.Rows[index].toString();
            }
            return valueString;
        }
    }
    HtmlAlign.GridCssProperty = GridCssProperty;
    class GridPlaceCssProperty {
        constructor() {
            this.regExpPlace = /^\s*(\d*)\s*(\d*).*$/;
            this.Name = "--place";
            this.Context = HtmlAlign.CssPropertyContext.Child;
        }
        DefaultValue() {
            return "0 0";
        }
        SetValueFromCssProperty(valueString, component) {
            var matchs = this.regExpPlace.exec(valueString);
            if (matchs[1] != undefined) {
                component.FatherAttached["Column"] = parseInt(matchs[1]);
            }
            else {
                component.FatherAttached["Column"] = 0;
            }
            if (matchs[2] != undefined) {
                component.FatherAttached["Row"] = parseInt(matchs[2]);
            }
            else {
                component.FatherAttached["Row"] = 0;
            }
        }
        GetValueStringFromComponent(component) {
            return component.FatherAttached["Column"] + " " + component.FatherAttached["Row"];
        }
    }
    HtmlAlign.GridPlaceCssProperty = GridPlaceCssProperty;
    class GridBehavior {
        constructor() {
            this.Name = "grid";
            this.IsLayoutOverridedInArrange = false;
        }
        GetNew() {
            return new GridBehavior();
        }
        GetCssProperties() {
            return [GridBehavior.GridCssProperty, GridBehavior.GridPlaceCssProperty];
        }
        Measure() {
            this._places = [];
            this._columnsMaxSizes = [];
            this._rowsMaxSizes = [];
            this._columnStarCount = 0;
            this._rowStarCount = 0;
            this._totalColumnDesiredSizeNotStar = 0;
            this._totalRowDesiredSizeNotStar = 0;
            for (var indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                this._rowsMaxSizes.push(0);
                if (this.Rows[indexRow].Star > 0) {
                    this._rowStarCount += this.Rows[indexRow].Star;
                }
            }
            for (var indexColumn = 0; indexColumn < this.Columns.length; indexColumn++) {
                this._columnsMaxSizes.push(0);
                if (this.Columns[indexColumn].Star > 0) {
                    this._columnStarCount += this.Columns[indexColumn].Star;
                }
                for (var indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                    var place = new HtmlAlign.Component(this.Component, undefined);
                    place.H.Size = this.Columns[indexColumn];
                    place.V.Size = this.Rows[indexRow];
                    for (var indexChild = 0; indexChild < this.Component.Children.length; indexChild++) {
                        var child = this.Component.Children[indexChild];
                        if (child.FatherAttached["Column"] == indexColumn
                            && child.FatherAttached["Row"] == indexRow) {
                            place.Children.push(child);
                        }
                    }
                    this._places.push(place);
                    if (place.H.Star == 0 || place.V.Star == 0) {
                        place.Measure(this.Component.H.ContentDelimiter, this.Component.V.ContentDelimiter);
                        if (place.H.Star == 0 && place.H.ComponentRequired > this._columnsMaxSizes[indexColumn]) {
                            this._columnsMaxSizes[indexColumn] = place.H.ComponentRequired;
                        }
                        if (place.V.Star == 0 && place.V.ComponentRequired > this._rowsMaxSizes[indexRow]) {
                            this._rowsMaxSizes[indexRow] = place.V.ComponentRequired;
                        }
                    }
                }
                this._totalColumnDesiredSizeNotStar += this._columnsMaxSizes[indexColumn];
            }
            for (var indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                this._totalRowDesiredSizeNotStar += this._rowsMaxSizes[indexRow];
            }
            this.Component.H.ContentDesired = this._totalColumnDesiredSizeNotStar;
            this.Component.V.ContentDesired = this._totalRowDesiredSizeNotStar;
        }
        Arrange() {
            if (this._columnStarCount > 0 && this.Component.H.ComponentSpace.Size > this._totalColumnDesiredSizeNotStar) {
                var columnStarProportion = (this.Component.H.ComponentSpace.Size
                    - this._totalColumnDesiredSizeNotStar) / this._columnStarCount;
                for (var indexColumn = 0; indexColumn < this.Columns.length; indexColumn++) {
                    if (this.Columns[indexColumn].Star > 0) {
                        this._columnsMaxSizes[indexColumn] = columnStarProportion * this.Columns[indexColumn].Star;
                    }
                }
            }
            if (this._rowStarCount > 0 && this.Component.V.ComponentSpace.Size > this._totalRowDesiredSizeNotStar) {
                var rowStarProportion = (this.Component.V.ComponentSpace.Size
                    - this._totalRowDesiredSizeNotStar) / this._rowStarCount;
                for (var indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                    if (this.Rows[indexRow].Star > 0) {
                        this._rowsMaxSizes[indexRow] = rowStarProportion * this.Rows[indexRow].Star;
                    }
                }
            }
            var quantityOfRows = this._rowsMaxSizes.length;
            var rowPostion = 0;
            var rowDisplacement = 0;
            var rowSize = 0;
            var columnPosition = -1;
            var columnDisplacement = 0;
            var columnSize = 0;
            for (var indexPlace = 0; indexPlace < this._places.length; indexPlace++) {
                var place = this._places[indexPlace];
                rowPostion = indexPlace % quantityOfRows;
                if (rowPostion == 0) {
                    rowDisplacement = 0;
                }
                else {
                    rowDisplacement += rowSize;
                }
                rowSize = this._rowsMaxSizes[rowPostion];
                if (columnPosition < Math.floor(indexPlace / quantityOfRows)) {
                    columnPosition++;
                    columnDisplacement += columnSize;
                    columnSize = this._columnsMaxSizes[columnPosition];
                }
                place.H.GivedSpace = new HtmlAlign.Space(this.Component.H.ContentSpace.Displacement + columnDisplacement, columnSize);
                place.V.GivedSpace = new HtmlAlign.Space(this.Component.V.ContentSpace.Displacement + rowDisplacement, rowSize);
                place.Arrange();
            }
        }
    }
    GridBehavior.GridCssProperty = new GridCssProperty();
    GridBehavior.GridPlaceCssProperty = new GridPlaceCssProperty();
    HtmlAlign.GridBehavior = GridBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/// <reference path='../Component.ts'/>
// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform
var HtmlAlign;
/// <reference path='../Component.ts'/>
// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform
(function (HtmlAlign) {
    class FitCssProperty {
        constructor() {
            this.regExpString = /^\s*(\w*).*$/;
            this.Name = "--fit";
            this.Context = HtmlAlign.CssPropertyContext.Component;
        }
        DefaultValue() {
            return "uniform";
        }
        SetValueFromCssProperty(valueString, component) {
            var valueString = this.regExpString.exec(valueString)[1];
            var fitBehavior = component.Behavior;
            if (valueString == "fit")
                fitBehavior.Fit = HtmlAlign.Fit.Fit;
            else if (valueString == "horizontal")
                fitBehavior.Fit = HtmlAlign.Fit.Horizontal;
            else if (valueString == "vertical")
                fitBehavior.Fit = HtmlAlign.Fit.Vertical;
            else
                fitBehavior.Fit = HtmlAlign.Fit.Uniform;
        }
        GetValueStringFromComponent(component) {
            var fitBehavior = component.Behavior;
            if (fitBehavior.Fit == HtmlAlign.Fit.Fit)
                return "fit";
            else if (fitBehavior.Fit == HtmlAlign.Fit.Horizontal)
                return "horizontal";
            else if (fitBehavior.Fit == HtmlAlign.Fit.Vertical)
                return "vertical";
            else
                return "uniform";
        }
    }
    HtmlAlign.FitCssProperty = FitCssProperty;
    class FitBehavior extends HtmlAlign.PanelBehavior {
        constructor() {
            super(...arguments);
            this.Name = "fit";
            this.IsLayoutOverridedInArrange = true;
        }
        GetNew() {
            return new FitBehavior();
        }
        GetCssProperties() {
            return [FitBehavior.FitCssProperty];
        }
        Measure() {
            var value = this.Component.Element.style.getPropertyValue("transform");
            this.OnDispose();
            super.Measure();
            this.Component.Element.style.setProperty("transform", value);
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }
        Arrange() {
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
            if (this.Component.H.Align == HtmlAlign.Align.Center) {
                transformOriginH = this.Component.H.ComponentRequired / 2;
            }
            else if (this.Component.H.Align == HtmlAlign.Align.End) {
                transformOriginH = this.Component.H.ComponentRequired;
            }
            else if (this.Component.H.Align == HtmlAlign.Align.Streach) {
                uniformWidth = 1;
            }
            if (this.Component.V.Align == HtmlAlign.Align.Center) {
                transformOriginV = this.Component.V.ComponentRequired / 2;
            }
            else if (this.Component.V.Align == HtmlAlign.Align.End) {
                transformOriginV = this.Component.V.ComponentRequired;
            }
            else if (this.Component.V.Align == HtmlAlign.Align.Streach) {
                uniformHeight = 1;
            }
            this.Component.Element.style.transformOrigin = transformOriginH + "px " + transformOriginV + "px";
            if (this.Fit == HtmlAlign.Fit.Uniform) {
                this.Component.Element.style.transform = "scale(" + Math.min(uniformWidth, uniformHeight) + ")";
            }
            else if (this.Fit == HtmlAlign.Fit.Fit) {
                this.Component.Element.style.transform = "scale(" + uniformWidth + "," + uniformHeight + ")";
            }
            else if (this.Fit == HtmlAlign.Fit.Horizontal) {
                this.Component.Element.style.transform = "scale(" + uniformWidth + ",1)";
            }
            else if (this.Fit == HtmlAlign.Fit.Vertical) {
                this.Component.Element.style.transform = "scale(1," + uniformHeight + ")";
            }
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }
        OnDispose() {
            this.Component.Element.style.removeProperty("transform");
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.Component.Element["laststyle"] = this.Component.Element.getAttribute("style");
        }
    }
    FitBehavior.FitCssProperty = new FitCssProperty();
    HtmlAlign.FitBehavior = FitBehavior;
})(HtmlAlign || (HtmlAlign = {}));
// [TODO] : para componentes não panel, se misturar porcentagens e valores fixos podem haver problemas
// criar um sistema de medida que adereça esses problemas
/// <reference path='Component.ts'/>
/// <reference path='Behaviors/PanelBehavior.ts' />
/// <reference path='Behaviors/InBehavior.ts' />
/// <reference path='Behaviors/LogicalBehavior.ts' />
/// <reference path='Behaviors/BodyBehavior.ts' />
/// <reference path='Behaviors/StackBehavior.ts' />
/// <reference path='Behaviors/WrapBehavior.ts' />
/// <reference path='Behaviors/DockBehavior.ts' />
/// <reference path='Behaviors/GridBehavior.ts' />
/// <reference path='Behaviors/FitBehavior.ts' />
var HtmlAlign;
// [TODO] : para componentes não panel, se misturar porcentagens e valores fixos podem haver problemas
// criar um sistema de medida que adereça esses problemas
/// <reference path='Component.ts'/>
/// <reference path='Behaviors/PanelBehavior.ts' />
/// <reference path='Behaviors/InBehavior.ts' />
/// <reference path='Behaviors/LogicalBehavior.ts' />
/// <reference path='Behaviors/BodyBehavior.ts' />
/// <reference path='Behaviors/StackBehavior.ts' />
/// <reference path='Behaviors/WrapBehavior.ts' />
/// <reference path='Behaviors/DockBehavior.ts' />
/// <reference path='Behaviors/GridBehavior.ts' />
/// <reference path='Behaviors/FitBehavior.ts' />
(function (HtmlAlign) {
    class CssPropertyEntry {
        constructor(BehaviorName, CssProperty) {
            this.BehaviorName = BehaviorName;
            this.CssProperty = CssProperty;
        }
    }
    class System {
        constructor() {
            this._behaviors = [];
            this._cssPropertyEntry = [];
            this.MaxContentString = "max-content";
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                this.MaxContentString = "-moz-max-content";
            }
            // inicializa os comportamentos padrões
            this.RegisterBehavior(new HtmlAlign.PanelBehavior());
            this.RegisterBehavior(new HtmlAlign.InBehavior());
            this.RegisterBehavior(new HtmlAlign.StackBehavior());
            this.RegisterBehavior(new HtmlAlign.WrapBehavior());
            this.RegisterBehavior(new HtmlAlign.DockBehavior());
            this.RegisterBehavior(new HtmlAlign.GridBehavior());
            this.RegisterBehavior(new HtmlAlign.FitBehavior());
            this.RefreshBaseStyle();
        }
        RefreshBaseStyle() {
            var cssList = [];
            var behaviorNameList = [];
            var panelDefaultValuesList = [];
            for (var index = 0; index < this._behaviors.length; index++) {
                behaviorNameList.push(this._behaviors[index].Name);
            }
            behaviorNameList.push("body");
            behaviorNameList.push("*[in]");
            panelDefaultValuesList.push("box-sizing:border-box");
            panelDefaultValuesList.push("position:absolute");
            var panelCssProperties = this._behaviors[0].GetCssProperties();
            for (var index = 0; index < panelCssProperties.length; index++) {
                var panelCssProperty = panelCssProperties[index];
                var defaultValue = panelCssProperty.DefaultValue();
                if (defaultValue != null) {
                    panelDefaultValuesList.push(panelCssProperty.Name + ":" + defaultValue);
                }
            }
            cssList.push(behaviorNameList.join(",") + "{" + panelDefaultValuesList.join(";") + "}");
            for (var index = 2; index < this._behaviors.length; index++) {
                var behavior = this._behaviors[index];
                var behaviorCssProperties = behavior.GetCssProperties();
                var behaviorComponentCssList = [];
                var behaviorChildCssList = [];
                behaviorComponentCssList.push("--behavior:" + behavior.Name);
                for (var indexCssProperty = 0; indexCssProperty < behaviorCssProperties.length; indexCssProperty++) {
                    var behaviorCssProperty = behaviorCssProperties[indexCssProperty];
                    var defaultValue = behaviorCssProperty.DefaultValue();
                    if (defaultValue != null) {
                        if (behaviorCssProperty.Context == HtmlAlign.CssPropertyContext.Component) {
                            behaviorComponentCssList.push(behaviorCssProperty.Name + ":" + defaultValue);
                        }
                        else {
                            behaviorChildCssList.push(behaviorCssProperty.Name + ":" + defaultValue);
                        }
                    }
                }
                cssList.push(behavior.Name + "{" + behaviorComponentCssList.join(";") + "}");
                if (behaviorChildCssList.length > 0) {
                    cssList.push(behavior.Name + ">*{" + behaviorChildCssList.join(";") + "}");
                }
            }
            cssList.push("body{overflow:auto;margin:0}");
            cssList.push("in,*[in]{--behavior:in;width:" + this.MaxContentString
                + ";height:" + this.MaxContentString + ";}");
            if (this._baseStyleElement) {
                document.head.removeChild(this._baseStyleElement);
            }
            this._baseStyleElement = document.createElement("style");
            this._baseStyleElement.title = "text/css";
            this._baseStyleElement.appendChild(document.createTextNode(cssList.join("\n")));
            if (document.head.firstChild != undefined) {
                document.head.insertBefore(this._baseStyleElement, document.head.firstChild);
            }
            else {
                document.head.appendChild(this._baseStyleElement);
            }
            if (this._root) {
                this.ForceRereadAllCssProperties(this._root);
            }
        }
        Init() {
            // inicializa o componente raiz
            // adiciona um componente pai ao componente raiz
            // esse componente será o finalizador da propagação de notificação de atualização
            var rootFather = { Behavior: {} };
            rootFather.NotifyNeedMeasure = function () {
                HtmlAlign.RefreshLayout();
                HtmlAlign.Log.RootMeasuresNotified++;
            };
            rootFather.NotifyToRefreshArrange = function () { HtmlAlign.Log.RootArrangesNotified++; };
            rootFather.NotifyArrange = function () { HtmlAlign.Log.RootArrangesNotified++; };
            this._root = new HtmlAlign.Component(rootFather, document.body);
            document.body["component"] = this._root;
            // popula os tamanhos iniciais
            this.RefreshRootSize();
            this.ExecuteRefreshLayout();
        }
        ExecuteRefreshLayout() {
            this._root.Measure(HtmlAlign.SizeDelimiter.Default(), HtmlAlign.SizeDelimiter.Default());
            this._root.H.GivedSpace = new HtmlAlign.Space(0, this._root.H.ComponentRequired);
            this._root.V.GivedSpace = new HtmlAlign.Space(0, this._root.V.ComponentRequired);
            this._root.Arrange();
        }
        RefreshValuesFromCssProperties(component) {
            var css = window.getComputedStyle(component.Element);
            for (var index = 0; index < this._cssPropertyEntry.length; index++) {
                var entry = this._cssPropertyEntry[index];
                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.BehaviorName == "panel"
                    || (entry.CssProperty.Context == HtmlAlign.CssPropertyContext.Component
                        && component.Behavior.Name == entry.BehaviorName)
                    || (entry.CssProperty.Context == HtmlAlign.CssPropertyContext.Child
                        && component.Father.Behavior.Name == entry.BehaviorName)) {
                    entry.CssProperty
                        .SetValueFromCssProperty(css.getPropertyValue(entry.CssProperty.Name), component);
                }
            }
            HtmlAlign.Log.ReadedCssProperties++;
        }
        RefreshRootSize() {
            var rootWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var rootHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            this._root.Width = { min: rootWidth, max: Number.POSITIVE_INFINITY };
            this._root.Height = { min: rootHeight, max: Number.POSITIVE_INFINITY };
        }
        RegisterBehavior(behavior) {
            this._behaviors.push(behavior);
            var behaviorCssProperties = behavior.GetCssProperties();
            if (behaviorCssProperties != null) {
                for (var index = 0; index < behaviorCssProperties.length; index++) {
                    this._cssPropertyEntry.push(new CssPropertyEntry(behavior.Name, behaviorCssProperties[index]));
                }
            }
        }
        IsBehavior(element) {
            if (element.tagName == undefined) {
                return false;
            }
            var name = element.tagName.toLowerCase();
            for (var index = 0; index < this._behaviors.length; index++) {
                if (this._behaviors[index].Name == name) {
                    return true;
                }
            }
            if (element.attributes["in"] != null) {
                return true;
            }
            return false;
        }
        GetBehavior(component, behaviorName) {
            if (component.Element.tagName == "BODY") {
                return new HtmlAlign.BodyBehavior();
            }
            for (var index = 0; index < this._behaviors.length; index++) {
                var behavior = this._behaviors[index];
                if (behavior.Name == behaviorName) {
                    return behavior.GetNew();
                }
            }
            return null;
            // Se nenhum foi encontrado manda o default (primeiro a ser adicionado)
            //return this._behaviors[0].GetNew();
        }
        GetBehaviorName(component) {
            if (component.Behavior != undefined) {
                return component.Behavior.Name;
            }
        }
        _verifyStyleSheetChanged(refreshValuesFirst) {
            if (refreshValuesFirst) {
                this._verifyStyleSheetChangedComponent(this._root, true);
            }
            this._verifyStyleSheetChangedComponent(this._root, false);
        }
        _verifyStyleSheetChangedComponent(component, refreshValuesFirst) {
            var computed = window.getComputedStyle(component.Element);
            var cssText = "";
            for (var index = 0; index < this._cssPropertyEntry.length; index++) {
                var entry = this._cssPropertyEntry[index];
                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.BehaviorName == "panel"
                    || (entry.CssProperty.Context == HtmlAlign.CssPropertyContext.Component
                        && component.Behavior.Name == entry.BehaviorName)
                    || (entry.CssProperty.Context == HtmlAlign.CssPropertyContext.Child
                        && component.Father.Behavior.Name == entry.BehaviorName)) {
                    cssText += computed.getPropertyValue(entry.CssProperty.Name);
                }
            }
            // a fonte afetará o tamanho do conteúdo, por isso ela precisa ser salva
            if (component.IsContent) {
                cssText += computed.getPropertyValue("font");
            }
            if (component.FatherAttached["lastCssText"] == undefined || refreshValuesFirst) {
                component.FatherAttached["lastCssText"] = cssText;
            }
            else if (component.FatherAttached["lastCssText"] != cssText) {
                component.FatherAttached["lastCssText"] = cssText;
                component.NotifyTagChanged();
            }
            for (var index = 0; index < component.Children.length; index++) {
                this._verifyStyleSheetChangedComponent(component.Children[index], refreshValuesFirst);
            }
        }
        ForceRereadAllCssProperties(component) {
            component.NotifyTagChanged();
            for (var index = 0; index < component.Children.length; index++) {
                this.ForceRereadAllCssProperties(component.Children[index]);
            }
        }
    }
    HtmlAlign.Layout = new System();
    var _waitingToRefresh = false;
    var _inRefreshingProcess = false;
    var _hasRefreshGuarantee = false;
    function RefreshLayout() {
        if (!_waitingToRefresh && !_hasRefreshGuarantee) {
            _waitingToRefresh = true;
            setTimeout(_refreshProtection, 12);
        }
        else if (_inRefreshingProcess && !_hasRefreshGuarantee) {
            _hasRefreshGuarantee = true;
            setTimeout(_refreshGuarantee, 4);
        }
    }
    HtmlAlign.RefreshLayout = RefreshLayout;
    ;
    function _refreshGuarantee() {
        _hasRefreshGuarantee = false;
        RefreshLayout();
    }
    ;
    function _refreshProtection() {
        if (!_inRefreshingProcess) {
            _inRefreshingProcess = true;
            setTimeout(_refresh, 4);
        }
    }
    function _refresh() {
        try {
            HtmlAlign.Layout.ExecuteRefreshLayout();
            HtmlAlign.Log.LayoutRefreshed++;
        }
        catch (ex) {
            console.log("Erro em _refreshArrange");
            console.log(ex);
        }
        finally {
            _inRefreshingProcess = false;
            _waitingToRefresh = false;
        }
    }
    ;
    var _isVerifyingStyleSheet = true;
    function _verifyStyleSheetWorker() {
        var isDevToolsOpen = IsDevToolsOpen();
        if (HtmlAlign.Config.VerifyStyleSheetPeriodicaly
            || (isDevToolsOpen && HtmlAlign.Config.IfDevToolsOpenRefresh)) {
            HtmlAlign.Layout._verifyStyleSheetChanged(!_isVerifyingStyleSheet);
            _isVerifyingStyleSheet = true;
        }
        else {
            _isVerifyingStyleSheet = false;
        }
        if (HtmlAlign.Config.VerifyStyleSheetPeriodicaly) {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, HtmlAlign.Config.VerifyStyleSheetPeriodicalyDelay));
        }
        else if (isDevToolsOpen) {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, HtmlAlign.Config.DevToolsOpenRefreshDelay));
        }
        else {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, 2000));
        }
    }
    ;
    var _lastStateDevTools = false;
    function IsDevToolsOpen() {
        var threshold = HtmlAlign.Config.DevToolsTreshhold;
        var widthThreshold = window.outerWidth - (window.innerWidth * window.devicePixelRatio) > threshold;
        var heightThreshold = window.outerHeight - (window.innerHeight * window.devicePixelRatio) > threshold;
        if (!(heightThreshold && widthThreshold) &&
            ((window["Firebug"] && window["Firebug"].chrome &&
                window["Firebug"].chrome.isInitialized) || widthThreshold || heightThreshold)) {
            _lastStateDevTools = true;
            return true;
        }
        else if (_lastStateDevTools) {
            _lastStateDevTools = false;
            return true;
        }
        else {
            return false;
        }
    }
    ;
    function Debouncer(func, timeout) {
        var timeoutID, timeout = timeout || 200;
        return function () {
            var scope = this, args = arguments;
            clearTimeout(timeoutID);
            timeoutID = setTimeout(function () {
                func.apply(scope, Array.prototype.slice.call(args));
            }, timeout);
        };
    }
    ;
    var observer = new MutationObserver((mutations, observer) => {
        for (var indexComponent = 0; indexComponent < mutations.length; indexComponent++) {
            var mutationRecord = mutations[indexComponent];
            // se foi uma atualização de texto ou de uma tag que não implementa nenhum comportamento
            // é feita uma pesquisa subindo na árvore DOM por qual é o primeiro componente pai em que
            // essa atualização está contida, se esse componente é um conteúdo é disparada uma rotina
            // de medida para verificar se o conteúdo necessita de um novo espaço para si
            if (mutationRecord.type == "characterData" || mutationRecord.target["component"] == undefined) {
                var element = mutationRecord.target;
                while (element != undefined) {
                    if (element["component"] != null) {
                        var component = element["component"];
                        if (component.Behavior.Name == "in") {
                            component.NotifyTagChanged();
                            break;
                        }
                        else {
                            break;
                        }
                    }
                    element = element.parentElement;
                }
            }
            else {
                var component = mutationRecord.target["component"];
                if (mutationRecord.attributeName != undefined) {
                    var element = mutationRecord.target;
                    // se o componente estiver congelado ou a atualização ocorreu no atributo style mas refere-se
                    // apenas a atualização de posição conhecida não deve ser disparado uma medida
                    if (mutationRecord.attributeName == "style" && element["laststyle"] == element.getAttribute("style")) {
                        continue;
                    }
                    component.NotifyTagChanged();
                }
                for (var index = 0; index < mutationRecord.removedNodes.length; index++) {
                    component.NotifyRemoved(mutationRecord.removedNodes[index]);
                }
                // possível melhora, os elementos aparecem duplicados na lista
                for (var index = 0; index < mutationRecord.addedNodes.length; index++) {
                    component.NotifyAdded(mutationRecord.addedNodes[index]);
                }
            }
        }
    });
    function _init() {
        // realiza a primeira rotina de medição e arranjo
        HtmlAlign.Layout.Init();
        // inicia o observador de mudanças nos elementos
        observer.observe(document.body, { attributes: true, childList: true, subtree: true, characterData: true });
        // inicializa o verificador de update
        _verifyStyleSheetWorker();
        window.addEventListener('resize', Debouncer(function () { HtmlAlign.Layout.RefreshRootSize(); }, HtmlAlign.Config.ResizeDelay));
    }
    ;
    if (document.readyState === "complete") {
        _init();
    }
    else {
        window.addEventListener("load", function () { _init(); });
    }
    // configurações
    HtmlAlign.Config = {
        ResizeDelay: 4,
        DevToolsTreshhold: 160,
        IfDevToolsOpenRefresh: true,
        DevToolsOpenRefreshDelay: 400,
        VerifyStyleSheetPeriodicaly: false,
        VerifyStyleSheetPeriodicalyDelay: 1000
    };
    // logs
    HtmlAlign.Log = {
        LayoutRefreshed: 0,
        ReadedCssProperties: 0,
        AddedElements: 0,
        RemovedElements: 0,
        RootMeasuresNotified: 0,
        RootScrollMeasureAgain: 0,
        LogicalMeasureAgain: 0,
        BehaviorMeasureAgain: 0,
        Measures: 0,
        RootArrangesNotified: 0,
        BehaviorArranges: 0,
        Arranges: 0,
        Print: function () {
            console.log("LayoutRefreshed: " + HtmlAlign.Log.LayoutRefreshed.toString()
                + ";\nReadedCssProperties: " + HtmlAlign.Log.ReadedCssProperties.toString()
                + ";\nAddedElements: " + HtmlAlign.Log.AddedElements.toString()
                + ";\nRemovedElements: " + HtmlAlign.Log.RemovedElements.toString()
                + ";\nRootMeasuresNotified: " + HtmlAlign.Log.RootMeasuresNotified.toString()
                + ";\nRootScrollRemeasure: " + HtmlAlign.Log.RootScrollMeasureAgain.toString()
                + ";\nLogicalRemeasure: " + HtmlAlign.Log.LogicalMeasureAgain.toString()
                + ";\nBehaviorRemeasure: " + HtmlAlign.Log.BehaviorMeasureAgain.toString()
                + ";\nMeasures: " + HtmlAlign.Log.Measures.toString()
                + ";\nRootArrangesNotified: " + HtmlAlign.Log.RootArrangesNotified.toString()
                + ";\nBehaviorArranges: " + HtmlAlign.Log.BehaviorArranges.toString()
                + ";\nArranges: " + HtmlAlign.Log.Arranges.toString());
        }
    };
})(HtmlAlign || (HtmlAlign = {}));
//# sourceMappingURL=HtmlAlign.js.map
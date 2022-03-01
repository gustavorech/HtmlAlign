// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    // Enum para definir sobre qual contexto a propriedade CSS será aplicada
    let CssPropertyContext;
    (function (CssPropertyContext) {
        CssPropertyContext[CssPropertyContext["component"] = 1] = "component";
        CssPropertyContext[CssPropertyContext["child"] = 2] = "child";
    })(CssPropertyContext = HtmlAlign.CssPropertyContext || (HtmlAlign.CssPropertyContext = {}));
    // Enum para definir os valores de visibilidade possíveis
    let Scroll;
    (function (Scroll) {
        Scroll[Scroll["auto"] = 1] = "auto";
        Scroll[Scroll["visible"] = 2] = "visible";
        Scroll[Scroll["none"] = 3] = "none";
    })(Scroll = HtmlAlign.Scroll || (HtmlAlign.Scroll = {}));
    // Enum para definir os valores de referência lateral possíveis
    let Side;
    (function (Side) {
        Side[Side["left"] = 1] = "left";
        Side[Side["top"] = 2] = "top";
        Side[Side["right"] = 3] = "right";
        Side[Side["bottom"] = 4] = "bottom";
        Side[Side["all"] = 5] = "all";
    })(Side = HtmlAlign.Side || (HtmlAlign.Side = {}));
    // Enum para definir os valores de alinhamento possíveis (por demensão)
    let Align;
    (function (Align) {
        Align[Align["start"] = 1] = "start";
        Align[Align["center"] = 2] = "center";
        Align[Align["end"] = 3] = "end";
        Align[Align["streach"] = 4] = "streach";
    })(Align = HtmlAlign.Align || (HtmlAlign.Align = {}));
    // Enum para definir os eixos possíveis
    let Axis;
    (function (Axis) {
        Axis[Axis["horizontal"] = 1] = "horizontal";
        Axis[Axis["vertical"] = 2] = "vertical";
    })(Axis = HtmlAlign.Axis || (HtmlAlign.Axis = {}));
    // Enum para os componentes que se adequal ao tamanho
    let Fit;
    (function (Fit) {
        Fit[Fit["fit"] = 1] = "fit";
        Fit[Fit["uniform"] = 2] = "uniform";
        Fit[Fit["horizontal"] = 3] = "horizontal";
        Fit[Fit["vertical"] = 4] = "vertical";
    })(Fit = HtmlAlign.Fit || (HtmlAlign.Fit = {}));
})(HtmlAlign || (HtmlAlign = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class Rect {
        horizontal;
        vertical;
        static default() {
            return new Rect(0, 0);
        }
        constructor(horizontal, vertical) {
            this.horizontal = horizontal;
            this.vertical = vertical;
        }
        copy() {
            return new Rect(this.horizontal, this.vertical);
        }
        copyFrom(obj) {
            this.horizontal = obj.horizontal;
            this.vertical = obj.vertical;
        }
        getOnAxis(axis) {
            if (axis == HtmlAlign.Axis.horizontal) {
                return this.horizontal;
            }
            else {
                return this.vertical;
            }
        }
        getPerpendicularToAxis(axis) {
            if (axis == HtmlAlign.Axis.vertical) {
                return this.horizontal;
            }
            else {
                return this.vertical;
            }
        }
        setOnAxis(axis, value) {
            if (axis == HtmlAlign.Axis.horizontal) {
                this.horizontal = value;
            }
            else {
                this.vertical = value;
            }
        }
        setPerpendicularToAxis(axis, value) {
            if (axis == HtmlAlign.Axis.vertical) {
                this.horizontal = value;
            }
            else {
                this.vertical = value;
            }
        }
    }
    HtmlAlign.Rect = Rect;
    // Espaço ocupado por uma dimensão de um retângulo, possui as informações
    // de deslocamente desde a origem e de deslocamento relativo ao componente pai
    // junto a informação do tamanho do retângulo nessa dimensão
    class Space {
        displacement;
        size;
        static default() {
            return new Space(0, 0);
        }
        constructor(displacement, size) {
            this.displacement = displacement;
            this.size = size;
        }
        copy() {
            return new Space(this.displacement, this.size);
        }
        copyFrom(obj) {
            this.displacement = obj.displacement;
            this.size = obj.size;
        }
    }
    HtmlAlign.Space = Space;
    // Grossura de uma linha ou espaço em uma dimensão, tem as informações de grossura
    // no início da dimensão e no fim da dimensão
    class Thickness {
        start;
        end;
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
        copy() {
            return new Thickness(this.start, this.end);
        }
        static default() {
            return new Thickness(0, 0);
        }
        copyFrom(thickness) {
            this.start = thickness.start;
            this.end = thickness.end;
        }
        sum() {
            return this.start + this.end;
        }
    }
    HtmlAlign.Thickness = Thickness;
    // Especifica a extensão de tamanhos aceitos pelo componente em uma dimensão
    // se os valores de mínimos e máximos forem iguais indica que o componente tem
    // um tamanho fixo. Também há o valor estrela que indica tamanho proporcional
    class SizeRange {
        star;
        delimiter;
        min;
        minIsPercent;
        max;
        maxIsPercent;
        static default() {
            return new SizeRange(0, 0, 0, false, Number.POSITIVE_INFINITY, false);
        }
        constructor(star, delimiter, min, minIsPercent, max, maxIsPercent) {
            this.star = star;
            this.delimiter = delimiter;
            this.min = min;
            this.minIsPercent = minIsPercent;
            this.max = max;
            this.maxIsPercent = maxIsPercent;
            // inverte valores caso necessário, feito apenas na criação
            if (this.minIsPercent == this.maxIsPercent && this.min > this.max) {
                const swap = this.min;
                this.min = this.max;
                this.max = swap;
            }
        }
        copy() {
            return new SizeRange(this.star, this.delimiter, this.min, this.minIsPercent, this.max, this.maxIsPercent);
        }
        copyFrom(obj) {
            this.star = obj.star;
            this.delimiter = obj.delimiter;
            this.min = obj.min;
            this.minIsPercent = obj.minIsPercent;
            this.max = obj.max;
            this.maxIsPercent = obj.maxIsPercent;
        }
        toString() {
            if (this.star > 0) {
                return this.star + '*';
            }
            else if (this.max == Number.POSITIVE_INFINITY) {
                if (this.min == 0) {
                    return '~';
                }
                else {
                    return this.min + '~';
                }
            }
            else if (this.min == 0) {
                return '~' + this.max;
            }
            else if (this.min == this.max) {
                return this.min.toString();
            }
            else {
                return this.min + '~' + this.max;
            }
        }
    }
    HtmlAlign.SizeRange = SizeRange;
    class SizeDelimiter {
        min;
        max;
        static default() {
            return new SizeDelimiter(0, Number.POSITIVE_INFINITY);
        }
        constructor(min, max) {
            this.min = min;
            this.max = max;
        }
        copy() {
            return new SizeDelimiter(this.min, this.max);
        }
        copyFrom(obj) {
            this.min = obj.min;
            this.max = obj.max;
        }
    }
    HtmlAlign.SizeDelimiter = SizeDelimiter;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Enums.ts'/>
/// <reference path='Interfaces.ts'/>
/// <reference path='ValueTypes.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class Dimension {
        _axis;
        isParentAPanel = true;
        isVisible = true;
        scroll = HtmlAlign.Scroll.none;
        align = HtmlAlign.Align.start;
        size = new HtmlAlign.SizeRange(0, 0, 0, false, 0, false);
        margin = new HtmlAlign.Thickness(0, 0);
        border = new HtmlAlign.Thickness(0, 0);
        padding = new HtmlAlign.Thickness(0, 0);
        isComponentDelimiterChanged = false;
        isComponentDesiredChanged = false;
        isNeedMeasureAgain = false;
        isComponentDisplacementChanged = false;
        isComponentSizeChanged = false;
        isComponentSpaceChanged = false;
        #actualSize = 0;
        #actualDisplacement = 0;
        #givedDelimiter = new HtmlAlign.SizeDelimiter(0, 0);
        #componentDelimiter = new HtmlAlign.SizeDelimiter(0, 0);
        #contentDelimiter = new HtmlAlign.SizeDelimiter(0, 0);
        #contentDesired = 0;
        #componentDesired = 0;
        #componentRequired = 0;
        #savedComponentDesired = 0;
        #givedSpace = new HtmlAlign.Space(0, 0);
        #componentSpace = new HtmlAlign.Space(0, 0);
        #contentSpace = new HtmlAlign.Space(0, 0);
        constructor(_axis) {
            this._axis = _axis;
        }
        get actualSize() {
            return this.#actualSize;
        }
        set actualSize(value) {
            this.#actualSize = value;
        }
        get actualDisplacement() {
            return this.#actualDisplacement;
        }
        set actualDisplacement(value) {
            this.#actualDisplacement = value;
        }
        get componentDelimiter() {
            return this.#componentDelimiter;
        }
        get contentDelimiter() {
            return this.#contentDelimiter;
        }
        get componentDesired() {
            return this.#componentDesired;
        }
        get componentRequired() {
            return this.#componentRequired;
        }
        get componentSpace() {
            return this.#componentSpace;
        }
        get contentSpace() {
            return this.#contentSpace;
        }
        // [TODO] precisa analisar
        // informa se o tamanho dessa dimensão é fixa
        get isFixed() {
            return (this.size.minIsPercent == this.size.maxIsPercent &&
                this.size.star == 0 &&
                !this.size.minIsPercent &&
                this.size.min == this.size.max);
        }
        // [TODO] precisa analisar
        // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
        // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
        // ao componente pai ele precisará ser rearranjado
        get needArrange() {
            return (this.isComponentDesiredChanged ||
                (this.isComponentDelimiterChanged &&
                    (this.size.minIsPercent ||
                        this.size.maxIsPercent ||
                        this.size.star > 0 ||
                        (this.align == HtmlAlign.Align.streach &&
                            this.size.max == Number.POSITIVE_INFINITY))));
        }
        // [TODO] precisa analisar
        get star() {
            if (!this.isVisible) {
                return 0;
            }
            return this.size.star;
        }
        get needLayout() {
            return (this.#actualSize != this.#componentSpace.size ||
                this.#actualDisplacement != this.#componentSpace.displacement);
        }
        // passo 1: behavior informa a delimitação de tamanho
        // componente verifica qual sua delimitação e a do conteúdo
        get givedDelimiter() {
            return this.#givedDelimiter;
        }
        set givedDelimiter(value) {
            // inicialização
            this.#givedDelimiter.min = value.min;
            this.#givedDelimiter.max = value.max;
            // salva valores antigos para verificar mudança
            const lastComponentDelimiterMin = this.#componentDelimiter.min;
            const lastComponentDelimiterMax = this.#componentDelimiter.max;
            // se o valor for proporcional ou percentual a margem do componente deve
            // estar incluída no delimitador
            // se for * apenas assume o delimitador entregue pelo componente
            // pai na integra, provavelmente o componente precisará ser medido uma
            // segunda vez
            if (this.size.star > 0) {
                this.#componentDelimiter.copyFrom(this.#givedDelimiter);
            }
            else if (this.size.delimiter > 0) {
                this.#componentDelimiter.min =
                    (this.#givedDelimiter.max * this.size.delimiter) / 100;
                if (this.#componentDelimiter.min < this.size.min) {
                    this.#componentDelimiter.min = this.size.min + this.margin.sum();
                }
                else if (this.#componentDelimiter.min > this.size.max) {
                    this.#componentDelimiter.min = this.size.max + this.margin.sum();
                }
                this.#componentDelimiter.max = this.#componentDelimiter.min;
            }
            // se não ou calcula as porcentagens caso as extremidades forem porcentagens
            // ou assume exatamente o que o componente quer
            // se o componente tiver tamanho percentual mínimo pode haver necessidade de uma nova medida
            // se o componente tiver alinhamento streach e o tamanho máximo for infinito
            // pode haver a necessidade de uma nova medida
            // as necessidades de novas medidas são condicionais a ampliação do tamanho do componente
            // pai e isso será conhecido no passo de arranjo
            else {
                if (this.size.minIsPercent) {
                    this.#componentDelimiter.min =
                        (this.#givedDelimiter.min * this.size.min) / 100;
                }
                else {
                    this.#componentDelimiter.min = this.size.min + this.margin.sum();
                }
                if (this.size.maxIsPercent) {
                    this.#componentDelimiter.max =
                        (this.#givedDelimiter.max * this.size.max) / 100;
                }
                else {
                    this.#componentDelimiter.max = this.size.max + this.margin.sum();
                }
                if (!this.size.minIsPercent &&
                    this.size.maxIsPercent &&
                    this.#componentDelimiter.max < this.#componentDelimiter.min) {
                    this.#componentDelimiter.max = this.#componentDelimiter.min;
                }
                if (this.size.minIsPercent &&
                    !this.size.maxIsPercent &&
                    this.#componentDelimiter.max < this.#componentDelimiter.min) {
                    this.#componentDelimiter.min = this.#componentDelimiter.max;
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
            if (this.isParentAPanel &&
                this.size.star == 0 &&
                this.givedDelimiter.max != Number.POSITIVE_INFINITY &&
                this.size.max == Number.POSITIVE_INFINITY &&
                this.align == HtmlAlign.Align.streach &&
                this.#componentDelimiter.min < this.#givedDelimiter.max) {
                this.#componentDelimiter.min = this.#givedDelimiter.max;
            }
            // verifica qual a delimitação do conteúdo que é a delimitação do componente
            // menos seus espaçamentos e borda
            let totalSpacing = this.margin.sum() + this.border.sum() + this.padding.sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.scroll == HtmlAlign.Scroll.visible) {
                totalSpacing += 17;
            }
            this.#contentDelimiter.max = this.#componentDelimiter.max - totalSpacing;
            this.#contentDelimiter.min = this.#componentDelimiter.min - totalSpacing;
            // ajusta o delimitador do componente se a porcentagem for maior que 100%
            if (this.size.star == 0) {
                if (this.size.minIsPercent && this.size.min > 100) {
                    this.#componentDelimiter.min = this.#givedDelimiter.min;
                }
                if (this.size.maxIsPercent && this.size.max > 100) {
                    this.#componentDelimiter.max = this.#givedDelimiter.max;
                }
            }
            // verifica mudança e sinaliza caso houve
            this.isComponentDelimiterChanged =
                this.#componentDelimiter.min != lastComponentDelimiterMin ||
                    this.#componentDelimiter.max != lastComponentDelimiterMax;
        }
        // passo 2: behavior informa, segundo suas regras, qual o tamanho
        // que precisará para o conteúdo
        // componente verifica qual o tamanho desejado e quanto irá requerer
        // do componente pai
        get contentDesired() {
            return this.#contentDesired;
        }
        set contentDesired(value) {
            // inicialização
            this.#contentDesired = value;
            // salva valor antigo para verificar mudança
            const lastComponentDesired = this.#componentRequired;
            // o que o componente deseja é o que o seu conteúdo deseja mais
            // seus espaçamentos
            this.#componentDesired =
                this.#contentDesired +
                    this.margin.sum() +
                    this.border.sum() +
                    this.padding.sum();
            // se o scroll estiver visivel acrescenta o tamanho do scroll
            if (this.scroll == HtmlAlign.Scroll.visible) {
                this.#componentDesired += 17;
            }
            this.#componentRequired = this.#componentDesired;
            // se o pai for um Panel e o tamanho máximo for percentual
            // informa o tamanho máximo já incluindo a porcentagem
            if (this.isParentAPanel && this.size.maxIsPercent) {
                // salva o valor desejado correto e verifica pelo mínimo
                this.#savedComponentDesired = this.#componentRequired;
                if (this.#savedComponentDesired < this.#componentDelimiter.min) {
                    this.#savedComponentDesired = this.#componentDelimiter.min;
                }
                this.#componentRequired =
                    (this.#componentRequired * 100) / this.size.max;
            }
            // verifica o delimitador desejado pelo componente, um componente nunca deseja mais que
            // o seu delimitador
            if (this.#componentRequired < this.#componentDelimiter.min) {
                this.#componentRequired = this.#componentDelimiter.min;
            }
            else if (this.#componentRequired > this.#componentDelimiter.max) {
                this.#componentRequired = this.#componentDelimiter.max;
            }
            // caso contrário o tamanho já estava no intervalo, mas isso não garante
            // que não seja necessário uma nova medida
            // verifica mudança e sinaliza caso houve
            this.isComponentDesiredChanged =
                this.#componentRequired != lastComponentDesired;
        }
        // passo 3: behavior informa o espaço final decidido para o componente
        // componente verifica o espaço que irá ocupar conforme seu arranjo
        // componente verifica qual o espaço para o conteúdo
        get givedSpace() {
            return this.#givedSpace;
        }
        set givedSpace(value) {
            // inicialização
            this.#givedSpace.size = value.size;
            this.#givedSpace.displacement = value.displacement;
            // salva valores antigos para verificar mudança
            const lastComponentSpaceDisplacement = this.#componentSpace.displacement;
            const lastComponentSpaceSize = this.#componentSpace.size;
            // se for estrela, o valor informado substitui o desejado
            if (this.size.star > 0) {
                this.#componentSpace.size = this.#givedSpace.size;
                if (this.#componentSpace.size != this.#componentRequired) {
                    this.isNeedMeasureAgain = true;
                }
            }
            else if (this.size.delimiter > 0) {
                this.#componentSpace.size =
                    (this.#givedSpace.size * this.size.delimiter) / 100;
                if (this.#componentSpace.size != this.#componentRequired) {
                    this.isNeedMeasureAgain = true;
                    if (this.#componentSpace.size < this.size.min) {
                        this.#componentSpace.size = this.size.min;
                    }
                    else if (this.#componentSpace.size > this.size.max) {
                        this.#componentSpace.size = this.size.max;
                    }
                }
            }
            // se o componente pai for um Panel refaz as validações por mínimos e máximos percentuais
            else if (this.isParentAPanel) {
                // garante que o tamanho máximo percentual seja respeitado
                if (this.size.maxIsPercent) {
                    this.componentSpace.size = this.#savedComponentDesired;
                    // se o mínimo não for percentual e o tamanho dado está igual ao mínimo
                    // respeita esse tamanho
                    if (this.componentSpace.size != this.componentDelimiter.min ||
                        this.size.minIsPercent) {
                        const maxSize = (this.#givedSpace.size * this.size.max) / 100;
                        if (this.#componentSpace.size > maxSize) {
                            this.isNeedMeasureAgain = true;
                            this.#componentSpace.size = maxSize;
                        }
                    }
                }
                else {
                    this.#componentSpace.size = this.#componentRequired;
                }
                // garante que o tamanho mínimo percentual seja respeitado
                if (this.size.minIsPercent) {
                    const minSize = (this.#givedSpace.size * this.size.min) / 100;
                    if (this.#componentSpace.size < minSize) {
                        this.isNeedMeasureAgain = true;
                        this.#componentSpace.size = minSize;
                    }
                }
            }
            // caso contrário o valor desejado é respeitado
            else {
                this.#componentSpace.size = this.#componentRequired;
            }
            // se o alinhamento for Streach e não há máximo, sempre utiliza todo o espaço
            if (this.size.max == Number.POSITIVE_INFINITY &&
                this.align == HtmlAlign.Align.streach) {
                this.#componentSpace.size = this.#givedSpace.size;
                if (this.#componentSpace.size != this.#componentRequired) {
                    this.isNeedMeasureAgain = true;
                }
            }
            // se tiver scroll nessa dimensão o conteúdo estará sempre visível
            if (this.scroll == HtmlAlign.Scroll.none ||
                this.#givedSpace.size > this.#componentSpace.size) {
                // verifica o distanciamento da origem a partir do alinhamento
                switch (this.align) {
                    case HtmlAlign.Align.center:
                        this.#componentSpace.displacement =
                            (this.#givedSpace.size - this.#componentSpace.size) / 2;
                        break;
                    case HtmlAlign.Align.end:
                        this.#componentSpace.displacement =
                            this.#givedSpace.size - this.#componentSpace.size;
                        break;
                    default:
                        this.#componentSpace.displacement = 0;
                }
            }
            else {
                this.#componentSpace.displacement = 0;
            }
            // tira a margem do tamanho do componente
            this.#componentSpace.size -= this.margin.sum();
            // adiciona o distanciamento da origem informado pelo componente pai
            this.#componentSpace.displacement += this.#givedSpace.displacement;
            // atualiza os valores do espaço de conteúdo
            this.#contentSpace.size =
                this.#componentSpace.size - this.border.sum() - this.padding.sum();
            // se o scroll estiver visivel tira o tamanho do scroll
            if (this.scroll === HtmlAlign.Scroll.visible) {
                this.#contentSpace.size -= 17;
            }
            this.#contentSpace.displacement = this.padding.start;
            // verifica mudança e sinaliza caso houve
            this.isComponentDisplacementChanged =
                this.#componentSpace.displacement !== lastComponentSpaceDisplacement;
            // verifica mudança e sinaliza caso houve
            this.isComponentSizeChanged =
                this.#componentSpace.size !== lastComponentSpaceSize;
            // verifica mudança e sinaliza caso houve
            this.isComponentSpaceChanged =
                this.isComponentDisplacementChanged || this.isComponentSizeChanged;
        }
        // passo 4: popular valores de layout
        refreshLayout(component) {
            let dimensionSizeProperty;
            let dimensionDisplacementProperty;
            if (this._axis === HtmlAlign.Axis.horizontal) {
                dimensionSizeProperty = 'width';
                dimensionDisplacementProperty = 'left';
            }
            else {
                dimensionSizeProperty = 'height';
                dimensionDisplacementProperty = 'top';
            }
            if (this.#actualSize !== this.#componentSpace.size) {
                this.#actualSize = this.#componentSpace.size;
                this.#actualSize = this.#actualSize > 0 ? this.#actualSize : 0;
                component.element.style.setProperty(dimensionSizeProperty, this.#actualSize + 'px');
            }
            if (this.#actualDisplacement !== this.#componentSpace.displacement) {
                this.#actualDisplacement = this.#componentSpace.displacement;
                this.#actualDisplacement =
                    this.#actualDisplacement > 0 ? this.#actualDisplacement : 0;
                component.element.style.setProperty(dimensionDisplacementProperty, this.#actualDisplacement + 'px');
            }
        }
    }
    HtmlAlign.Dimension = Dimension;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Dimension.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Dimension.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class Component {
        parent;
        element;
        // variáveis para auxiliar na identificação do componente
        get isLayoutComponent() {
            return this.#behavior.name !== 'in' && this.#behavior.name !== 'logical';
        }
        get isBehaviorComponent() {
            return (this.#behavior.name !== 'in' &&
                this.#behavior.name !== 'body' &&
                this.#behavior.name !== 'logical');
        }
        constructor(parent, element) {
            this.parent = parent;
            this.element = element;
            // componente lógico
            if (!this.element) {
                this.behavior = new HtmlAlign.LogicalBehavior();
                this.#behavior.component = this;
                return;
            }
            this.element.component = this;
            // realiza a primeira leitura das propriedades css
            HtmlAlign.Layout.refreshValuesFromCssProperties(this);
            this.processChangeChildren();
        }
        children = [];
        horizontal = new HtmlAlign.Dimension(HtmlAlign.Axis.horizontal);
        vertical = new HtmlAlign.Dimension(HtmlAlign.Axis.vertical);
        parentAttached = {};
        getOnAxis(axis) {
            return axis === HtmlAlign.Axis.horizontal ? this.horizontal : this.vertical;
        }
        getPerpendicularToAxis(axis) {
            return axis === HtmlAlign.Axis.horizontal ? this.vertical : this.horizontal;
        }
        setOnAxis(axis, value) {
            if (axis == HtmlAlign.Axis.horizontal) {
                this.horizontal = value;
            }
            else {
                this.vertical = value;
            }
        }
        setPerpendicularToAxis(axis, value) {
            if (axis == HtmlAlign.Axis.vertical) {
                this.horizontal = value;
            }
            else {
                this.vertical = value;
            }
        }
        #behavior;
        #isBehaviorChanged = false;
        get behavior() {
            return this.#behavior;
        }
        set behavior(value) {
            // [TODO] temporário, precisa melhorar
            if (!value) {
                if (!this.#behavior) {
                    value = new HtmlAlign.InBehavior();
                }
                else {
                    return;
                }
            }
            if (this.#behavior && this.#behavior.name != value.name) {
                this.#isBehaviorChanged = true;
                // [TODO] [FIT] temporário, precisa melhorar
                if (this.#behavior.name == 'fit') {
                    this.element.style.removeProperty('transform');
                }
            }
            if (!this.#behavior || this.#isBehaviorChanged) {
                this.#behavior = value;
            }
            this.horizontal.isParentAPanel = this.vertical.isParentAPanel =
                this.parent.behavior.name == 'panel' ||
                    this.parent.behavior.name == 'fit';
        }
        get isVisible() {
            return this.horizontal.isVisible;
        }
        set isVisible(value) {
            this.horizontal.isVisible = value;
            this.vertical.isVisible = value;
        }
        get horizontalScroll() {
            return this.horizontal.scroll;
        }
        set horizontalScroll(value) {
            this.horizontal.scroll = value;
        }
        get verticalScroll() {
            return this.vertical.scroll;
        }
        set verticalScroll(value) {
            this.vertical.scroll = value;
        }
        #isFrozen = false;
        frozen() {
            this.#isFrozen = true;
        }
        unfrozen() {
            this.#isFrozen = false;
            this.notifyCssPropertiesChanged();
            HtmlAlign.refreshLayout();
        }
        notifyCssPropertyChanged(cssProperty) {
            this.element.style.setProperty(cssProperty.name, cssProperty.getValueStringFromComponent(this));
            this.notifyNeedMeasure();
        }
        setCssPropertyValue(cssProperty) {
            this.element.style.setProperty(cssProperty.name, cssProperty.getValueStringFromComponent(this));
        }
        #childrenChanged = false;
        #cssPropertiesChanged = false;
        #needArrange = false;
        #childNeedArrange = false;
        #needMeasure = true;
        #needLayout = false;
        #childNeedLayout = false;
        notifyChildrenChanged() {
            if (this.isLayoutComponent) {
                this.#childrenChanged = true;
                this.notifyNeedMeasure();
            }
            else {
                this.notifyCssPropertiesChanged();
            }
        }
        notifyCssPropertiesChanged() {
            this.#cssPropertiesChanged = true;
            this.notifyNeedMeasure();
        }
        notifyNeedMeasure() {
            if (!this.#needMeasure) {
                this.#needMeasure = true;
                this.parent.notifyNeedMeasure();
            }
        }
        notifyNeedArrange() {
            this.#needArrange = true;
            this.parent.notifyChildNeedArrange();
        }
        notifyNeedArrangeWithParent() {
            this.notifyNeedArrange();
            this.parent.notifyNeedArrange();
        }
        notifyChildNeedArrange() {
            if (!this.#childNeedArrange) {
                this.#childNeedArrange = true;
                this.parent.notifyChildNeedArrange();
            }
        }
        notifyNeedLayout() {
            this.#needLayout = true;
            this.parent.notifyChildNeedLayout();
        }
        notifyChildNeedLayout() {
            if (!this.#childNeedLayout) {
                this.#childNeedLayout = true;
                this.parent.notifyChildNeedLayout();
            }
        }
        processChangeChildren() {
            this.#childrenChanged = false;
            if (!this.isLayoutComponent) {
                return;
            }
            const hasNoChildren = !this.element.firstElementChild;
            if (hasNoChildren) {
                this.children = [];
                this.notifyNeedArrangeWithParent();
                return;
            }
            if (this.children.length === 0) {
                let currentChildElement = (this.element.firstElementChild);
                while (currentChildElement) {
                    if (HtmlAlign.Layout.isBehavior(currentChildElement)) {
                        this.children.push(new Component(this, currentChildElement));
                    }
                    currentChildElement = (currentChildElement.nextElementSibling);
                }
                this.notifyNeedArrangeWithParent();
                return;
            }
            let currentChildElement = (this.element.firstElementChild);
            let currentChildPosition = 0;
            let currentChildComponent = this.children[currentChildPosition];
            // itera sobre todos os elementos irmãos
            while (currentChildElement) {
                if (!HtmlAlign.Layout.isBehavior(currentChildElement)) {
                    currentChildElement = (currentChildElement.nextElementSibling);
                    continue;
                }
                if (currentChildPosition === this.children.length) {
                    this.children.push(new Component(this, currentChildElement));
                    currentChildPosition++;
                    currentChildElement = (currentChildElement.nextElementSibling);
                    continue;
                }
                const componentAlreadyAssociatedWithElement = currentChildElement.component;
                if (!componentAlreadyAssociatedWithElement) {
                    this.children.splice(currentChildPosition, 0, new Component(this, currentChildElement));
                    currentChildPosition++;
                    currentChildElement = (currentChildElement.nextElementSibling);
                    continue;
                }
                while (componentAlreadyAssociatedWithElement != currentChildComponent &&
                    currentChildPosition < this.children.length) {
                    // [TODO] [FIT] temporário, precisa melhorar
                    if (componentAlreadyAssociatedWithElement.#behavior.name == 'fit') {
                        this.element.style.removeProperty('transform');
                    }
                    this.children.splice(currentChildPosition, 1);
                    currentChildComponent = this.children[currentChildPosition];
                }
                if (currentChildPosition < this.children.length) {
                    currentChildPosition++;
                    currentChildComponent = this.children[currentChildPosition];
                }
                currentChildElement = (currentChildElement.nextElementSibling);
            }
            this.notifyNeedArrangeWithParent();
        }
        processCssPropertiesChanged() {
            this.#cssPropertiesChanged = false;
            HtmlAlign.Layout.refreshValuesFromCssProperties(this);
            this.notifyNeedArrangeWithParent();
            // se o behavior modificou durante a leitura será necessário
            // ler novamente as propriedades e notificar os filhos para fazer o mesmo
            if (this.#isBehaviorChanged) {
                this.#isBehaviorChanged = false;
                HtmlAlign.Layout.refreshValuesFromCssProperties(this);
                for (let index = 0; index < this.children.length; index++) {
                    this.children[index].notifyCssPropertiesChanged();
                }
            }
        }
        measure(horizontal, vertical) {
            // componentes congelados não sofrem alterações
            if (this.#isFrozen || !this.isVisible) {
                return;
            }
            if (this.#childrenChanged) {
                this.processChangeChildren();
            }
            if (this.#cssPropertiesChanged) {
                this.processCssPropertiesChanged();
            }
            this.horizontal.givedDelimiter = horizontal;
            this.vertical.givedDelimiter = vertical;
            // se o elemento não precisa ser medido não precisa fazer nada
            if (!this.#needMeasure &&
                !this.horizontal.isComponentDelimiterChanged &&
                !this.vertical.isComponentDelimiterChanged) {
                return;
            }
            this.#behavior.measure();
            // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
            // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
            // ao componente pai ele precisará ser rearranjado
            if (this._canInformNeedArrangeInMeasure &&
                (this.horizontal.needArrange || this.vertical.needArrange)) {
                this.notifyNeedArrangeWithParent();
            }
            this.#needMeasure = false;
            HtmlAlign.Log.Measures++;
        }
        _canInformNeedArrangeInMeasure = true;
        #horizontalSizeDelimiter = new HtmlAlign.SizeDelimiter(0, 0);
        #verticalSizeDelimiter = new HtmlAlign.SizeDelimiter(0, 0);
        arrange() {
            // componentes congelados não sofrem alterações
            if (this.#isFrozen) {
                return;
            }
            // não há porque atualizar componentes sem visibilidade e que não afetam o layout
            // componentes congelados não sofrem alterações
            if (!this.isVisible || this.#isFrozen) {
                return;
            }
            if (this.#needArrange ||
                this.horizontal.isComponentSpaceChanged ||
                this.vertical.isComponentSpaceChanged ||
                this.horizontal.isNeedMeasureAgain ||
                this.vertical.isNeedMeasureAgain) {
                if (this.isBehaviorComponent &&
                    (this.horizontal.isNeedMeasureAgain ||
                        this.vertical.isNeedMeasureAgain)) {
                    this._canInformNeedArrangeInMeasure = false;
                    this.horizontal.isNeedMeasureAgain = false;
                    this.vertical.isNeedMeasureAgain = false;
                    this.#horizontalSizeDelimiter.min =
                        this.#horizontalSizeDelimiter.max = this.horizontal.givedSpace.size;
                    this.#verticalSizeDelimiter.min = this.#verticalSizeDelimiter.max =
                        this.vertical.givedSpace.size;
                    this.horizontal.givedDelimiter = this.#horizontalSizeDelimiter;
                    this.vertical.givedDelimiter = this.#verticalSizeDelimiter;
                    // verifica se precisa de uma nova medida
                    if (this.horizontal.isComponentDelimiterChanged ||
                        this.vertical.isComponentDelimiterChanged) {
                        this.#behavior.measure();
                    }
                    this._canInformNeedArrangeInMeasure = true;
                    HtmlAlign.Log.BehaviorMeasureAgain++;
                }
                this.#behavior.arrange();
                HtmlAlign.Log.BehaviorArranges++;
            }
            else if (this.#childNeedArrange) {
                // [TODO] [FIT] temporário, precisa melhorar
                if (this.#behavior.name == 'fit') {
                    this.#behavior.arrange();
                }
                else {
                    for (let index = 0; index < this.children.length; index++) {
                        this.children[index].arrange();
                    }
                }
            }
            this.#needArrange = false;
            this.#childNeedArrange = false;
            if (!this.#behavior.isLayoutOverridedInArrange &&
                (this.horizontal.needLayout || this.vertical.needLayout)) {
                this.#needLayout = true;
                this.parent.notifyChildNeedLayout();
            }
        }
        processLayout() {
            if (this.#needLayout) {
                this.horizontal.refreshLayout(this);
                this.vertical.refreshLayout(this);
                this.element['laststyle'] = this.element.getAttribute('style');
                this.#needLayout = false;
            }
            if (this.#childNeedLayout) {
                for (let i = 0; i < this.children.length; i++) {
                    this.children[i].processLayout();
                }
                this.#childNeedLayout = false;
            }
        }
    }
    HtmlAlign.Component = Component;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class BehaviorCssProperty {
        regExpString = /^\s*(\w*).*$/;
        name = '--behavior';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'panel';
        }
        setValueFromCssProperty(valueString, component) {
            component.behavior = HtmlAlign.Layout.getBehavior(component, this.regExpString.exec(valueString)[1]);
            if (component.behavior != null) {
                component.behavior.component = component;
            }
        }
        getValueStringFromComponent(component) {
            return HtmlAlign.Layout.getBehaviorName(component);
        }
    }
    HtmlAlign.BehaviorCssProperty = BehaviorCssProperty;
    class AlignCssProperty {
        regExpAlign = /^\s*(left|right|top|bottom|center|streach){0,1}\s*(left|right|top|bottom|center|streach){0,1}.*$/;
        name = '--align';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'streach';
        }
        setValueFromCssProperty(valueString, component) {
            const matchsAlign = this.regExpAlign.exec(valueString);
            const horizontal = matchsAlign[1];
            const vertical = matchsAlign[2];
            component.horizontal.align = HtmlAlign.Align.streach;
            component.vertical.align = HtmlAlign.Align.streach;
            const nextAxis = this.ReadAlign(HtmlAlign.Axis.horizontal, horizontal, component);
            if (vertical == null) {
                if (horizontal == 'streach' || horizontal == 'center') {
                    this.ReadAlign(nextAxis, horizontal, component);
                }
            }
            else {
                this.ReadAlign(nextAxis, vertical, component);
            }
        }
        ReadAlign(axis, valueString, component) {
            if (valueString == 'left') {
                if (axis == HtmlAlign.Axis.vertical) {
                    component.vertical.align = component.horizontal.align;
                }
                component.horizontal.align = HtmlAlign.Align.start;
                return HtmlAlign.Axis.vertical;
            }
            else if (valueString == 'right') {
                if (axis == HtmlAlign.Axis.vertical) {
                    component.vertical.align = component.horizontal.align;
                }
                component.horizontal.align = HtmlAlign.Align.end;
                return HtmlAlign.Axis.vertical;
            }
            else if (valueString == 'top') {
                component.vertical.align = HtmlAlign.Align.start;
                return HtmlAlign.Axis.horizontal;
            }
            else if (valueString == 'bottom') {
                component.vertical.align = HtmlAlign.Align.end;
                return HtmlAlign.Axis.horizontal;
            }
            else if (valueString == 'center') {
                component.getOnAxis(axis).align = HtmlAlign.Align.center;
                return HtmlAlign.Axis.vertical;
            }
            else {
                component.getOnAxis(axis).align = HtmlAlign.Align.streach;
                return HtmlAlign.Axis.vertical;
            }
        }
        getValueStringFromComponent(component) {
            let horizontal = 'left';
            const vertical = 'top';
            if (component.horizontal.align == HtmlAlign.Align.end) {
                horizontal = 'right';
            }
            else if (component.horizontal.align == HtmlAlign.Align.center) {
                horizontal = 'center';
            }
            else if (component.horizontal.align == HtmlAlign.Align.streach) {
                horizontal = 'streach';
            }
            if (component.vertical.align == HtmlAlign.Align.end) {
                horizontal = 'bottom';
            }
            else if (component.vertical.align == HtmlAlign.Align.center) {
                horizontal = 'center';
            }
            else if (component.vertical.align == HtmlAlign.Align.streach) {
                horizontal = 'streach';
            }
            if (horizontal == vertical) {
                return horizontal;
            }
            return horizontal + ' ' + vertical;
        }
    }
    HtmlAlign.AlignCssProperty = AlignCssProperty;
    class SizeCssProperty {
        regExpSize = /^\s*(\d*[.]?\d*)([%]([[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?)(?:\s+(\d*[.]?\d*)([%]([[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?))?.*$/;
        Default = HtmlAlign.SizeRange.default();
        name = '--size';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return '~';
        }
        setValueFromCssProperty(valueString, component) {
            const matchsSize = this.regExpSize.exec(valueString);
            component.horizontal.size = this.ReadSizeRange(matchsSize[1], matchsSize[2], matchsSize[4], matchsSize[5], matchsSize[6], matchsSize[7], matchsSize[8], this.Default);
            component.vertical.size = this.ReadSizeRange(matchsSize[9], matchsSize[10], matchsSize[12], matchsSize[13], matchsSize[14], matchsSize[15], matchsSize[16], component.horizontal.size);
        }
        getValueStringFromComponent(component) {
            return (component.horizontal.size.toString() +
                ' ' +
                component.vertical.size.toString());
        }
        ReadSizeRange(min, minPercentDesc, minPercentValue, maxPercentValue, type, max, maxPercent, def) {
            if (minPercentDesc && minPercentDesc.length > 1) {
                return new HtmlAlign.SizeRange(0, parseFloat(min) || 100, parseFloat(minPercentValue) || 0, false, parseFloat(maxPercentValue) || Number.POSITIVE_INFINITY, false);
            }
            const minIsPercent = minPercentDesc == '%';
            const maxIsPercent = maxPercent == '%';
            if (!type && !min && min != '0') {
                return new HtmlAlign.SizeRange(def.star, 0, def.min, def.minIsPercent, def.max, def.maxIsPercent);
            }
            else if (type == '~') {
                return new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
            }
            else if (type == '*') {
                return new HtmlAlign.SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
            }
            else if (min == '0') {
                return new HtmlAlign.SizeRange(0, 0, 0, false, 0, false);
            }
            else {
                return new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(min) || Number.POSITIVE_INFINITY, minIsPercent);
            }
        }
    }
    HtmlAlign.SizeCssProperty = SizeCssProperty;
    class DisplayCssProperty {
        name = 'display';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'block';
        }
        setValueFromCssProperty(valueString, component) {
            if (valueString.startsWith('none')) {
                component.isVisible = false;
            }
            else {
                component.isVisible = true;
            }
        }
        getValueStringFromComponent(component) {
            if (component.isVisible) {
                return 'block';
            }
            else {
                return 'none';
            }
        }
    }
    HtmlAlign.DisplayCssProperty = DisplayCssProperty;
    class OverflowCssProperty {
        regExpScroll = /^\s*(auto|overlay|hidden|scroll|visible){0,1}\s*(auto|overlay|hidden|scroll|visible){0,1}.*$/;
        name = 'overflow';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'visible';
        }
        setValueFromCssProperty(valueString, component) {
            const matchsAlign = this.regExpScroll.exec(valueString);
            const horizontal = matchsAlign[1];
            const vertical = matchsAlign[2] || horizontal;
            if (horizontal == 'auto' || horizontal == 'overlay') {
                component.horizontalScroll = HtmlAlign.Scroll.auto;
            }
            else if (horizontal == 'scroll') {
                component.horizontalScroll = HtmlAlign.Scroll.visible;
            }
            else {
                component.horizontalScroll = HtmlAlign.Scroll.none;
            }
            if (vertical == 'auto' || vertical == 'overlay') {
                component.verticalScroll = HtmlAlign.Scroll.auto;
            }
            else if (vertical == 'scroll') {
                component.verticalScroll = HtmlAlign.Scroll.visible;
            }
            else {
                component.verticalScroll = HtmlAlign.Scroll.none;
            }
        }
        getValueStringFromComponent(component) {
            return '';
        }
    }
    HtmlAlign.OverflowCssProperty = OverflowCssProperty;
    class MarginLeftCssProperty {
        name = 'margin-left';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.margin.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.margin.start.toString() + 'px';
        }
    }
    HtmlAlign.MarginLeftCssProperty = MarginLeftCssProperty;
    class MarginTopCssProperty {
        name = 'margin-top';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.margin.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.margin.start.toString() + 'px';
        }
    }
    HtmlAlign.MarginTopCssProperty = MarginTopCssProperty;
    class MarginRightCssProperty {
        name = 'margin-right';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.margin.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.margin.end.toString() + 'px';
        }
    }
    HtmlAlign.MarginRightCssProperty = MarginRightCssProperty;
    class MarginBottomCssProperty {
        name = 'margin-bottom';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.margin.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.margin.end.toString() + 'px';
        }
    }
    HtmlAlign.MarginBottomCssProperty = MarginBottomCssProperty;
    class BorderLeftCssProperty {
        name = 'border-left-width';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.border.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.border.start.toString() + 'px';
        }
    }
    HtmlAlign.BorderLeftCssProperty = BorderLeftCssProperty;
    class BorderTopCssProperty {
        name = 'border-top-width';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.border.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.border.start.toString() + 'px';
        }
    }
    HtmlAlign.BorderTopCssProperty = BorderTopCssProperty;
    class BorderRightCssProperty {
        name = 'border-right-width';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.border.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.border.end.toString() + 'px';
        }
    }
    HtmlAlign.BorderRightCssProperty = BorderRightCssProperty;
    class BorderBottomCssProperty {
        name = 'border-bottom-width';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.border.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.border.end.toString() + 'px';
        }
    }
    HtmlAlign.BorderBottomCssProperty = BorderBottomCssProperty;
    class PaddingLeftCssProperty {
        name = 'padding-left';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.padding.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.padding.start.toString() + 'px';
        }
    }
    HtmlAlign.PaddingLeftCssProperty = PaddingLeftCssProperty;
    class PaddingTopCssProperty {
        name = 'padding-top';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.padding.start = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.padding.start.toString() + 'px';
        }
    }
    HtmlAlign.PaddingTopCssProperty = PaddingTopCssProperty;
    class PaddingRightCssProperty {
        name = 'padding-right';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.horizontal.padding.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.horizontal.padding.end.toString() + 'px';
        }
    }
    HtmlAlign.PaddingRightCssProperty = PaddingRightCssProperty;
    class PaddingBottomCssProperty {
        name = 'padding-bottom';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return null;
        }
        setValueFromCssProperty(valueString, component) {
            component.vertical.padding.end = Number.parseInt(valueString);
        }
        getValueStringFromComponent(component) {
            return component.vertical.padding.end.toString() + 'px';
        }
    }
    HtmlAlign.PaddingBottomCssProperty = PaddingBottomCssProperty;
    class PanelBehavior {
        static BehaviorCssProperty = new BehaviorCssProperty();
        static AlignCssProperty = new AlignCssProperty();
        static SizeCssProperty = new SizeCssProperty();
        static DisplayCssProperty = new DisplayCssProperty();
        static OverflowCssProperty = new OverflowCssProperty();
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
        name = 'panel';
        component;
        isLayoutOverridedInArrange = false;
        getNew() {
            return new PanelBehavior();
        }
        getCssProperties() {
            return [
                PanelBehavior.BehaviorCssProperty,
                PanelBehavior.AlignCssProperty,
                PanelBehavior.SizeCssProperty,
                PanelBehavior.DisplayCssProperty,
                PanelBehavior.OverflowCssProperty,
                PanelBehavior.MarginLeftCssProperty,
                PanelBehavior.MarginTopCssProperty,
                PanelBehavior.MarginRightCssProperty,
                PanelBehavior.MarginBottomCssProperty,
                PanelBehavior.BorderLeftCssProperty,
                PanelBehavior.BorderTopCssProperty,
                PanelBehavior.BorderRightCssProperty,
                PanelBehavior.BorderBottomCssProperty,
                PanelBehavior.PaddingLeftCssProperty,
                PanelBehavior.PaddingTopCssProperty,
                PanelBehavior.PaddingRightCssProperty,
                PanelBehavior.PaddingBottomCssProperty
            ];
        }
        measure() {
            let maxHorizontalContentSize = 0;
            let maxVerticalContentSize = 0;
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                child.measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
                if (maxHorizontalContentSize < child.horizontal.componentRequired) {
                    maxHorizontalContentSize = child.horizontal.componentRequired;
                }
                if (maxVerticalContentSize < child.vertical.componentRequired) {
                    maxVerticalContentSize = child.vertical.componentRequired;
                }
            }
            this.component.horizontal.contentDesired = maxHorizontalContentSize;
            this.component.vertical.contentDesired = maxVerticalContentSize;
        }
        arrange() {
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                child.horizontal.givedSpace = this.component.horizontal.contentSpace;
                child.vertical.givedSpace = this.component.vertical.contentSpace;
                child.arrange();
            }
        }
    }
    HtmlAlign.PanelBehavior = PanelBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class InBehavior {
        name = 'in';
        component;
        isLayoutOverridedInArrange = true;
        _widthIsMaxContent = false;
        _heightIsMaxContent = false;
        _needInformLastStyle = false;
        getNew() {
            return new InBehavior();
        }
        getCssProperties() {
            return [];
        }
        measure() {
            // se o tamanho for fixo não há motivo para perguntar para o conteúdo
            // qual o tamanho que ele deseja para si
            if (this.component.horizontal.isFixed &&
                this.component.vertical.isFixed) {
                this._widthIsMaxContent = false;
                this._heightIsMaxContent = false;
                this.component.horizontal.contentDesired = 0;
                this.component.vertical.contentDesired = 0;
            }
            else {
                // se modificar as propriedades abaixo na primeria medida o tempo é muito alto
                if (!this._widthIsMaxContent) {
                    this._widthIsMaxContent = true;
                    this.component.element.style.removeProperty('width');
                    this._needInformLastStyle = true;
                }
                if (!this._heightIsMaxContent) {
                    this._heightIsMaxContent = true;
                    this.component.element.style.removeProperty('height');
                    this._needInformLastStyle = true;
                }
                const maxHorizontal = this.component.horizontal.givedDelimiter.max -
                    this.component.horizontal.margin.sum();
                // maior ou igual porque o clientWidth só informa a parte inteira do número
                if (this.component.element.clientWidth >= maxHorizontal) {
                    this.component.element.style.setProperty('width', maxHorizontal + 'px');
                    this._widthIsMaxContent = false;
                    if (!this._heightIsMaxContent) {
                        this._heightIsMaxContent = true;
                        this.component.element.style.removeProperty('height');
                    }
                    this._needInformLastStyle = true;
                }
                if (this._needInformLastStyle) {
                    this._needInformLastStyle = false;
                    // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
                    this.component.element['laststyle'] =
                        this.component.element.getAttribute('style');
                }
                const rect = this.component.element.getBoundingClientRect();
                this.component.horizontal.contentDesired =
                    rect.width -
                        this.component.horizontal.border.sum() -
                        this.component.horizontal.padding.sum();
                this.component.vertical.contentDesired =
                    rect.height -
                        this.component.vertical.border.sum() -
                        this.component.vertical.padding.sum();
                //this.Component.H.ActualSize = rect.width;
                //this.Component.V.ActualSize = rect.height;
            }
        }
        arrange() {
            if (this.component.horizontal.componentDesired !=
                this.component.horizontal.givedSpace.size) {
                this.component.horizontal.givedDelimiter = new HtmlAlign.SizeDelimiter(this.component.horizontal.givedSpace.size, this.component.horizontal.givedSpace.size);
                this.component.vertical.givedDelimiter = new HtmlAlign.SizeDelimiter(this.component.vertical.givedSpace.size, this.component.vertical.givedSpace.size);
                this.measure();
                if (this.component.horizontal.componentDesired !=
                    this.component.horizontal.givedSpace.size) {
                    this._widthIsMaxContent = false;
                }
                else {
                    this.component.horizontal.actualSize =
                        this.component.horizontal.componentSpace.size;
                }
            }
            if (this.component.vertical.componentDesired !=
                this.component.vertical.givedSpace.size) {
                this._heightIsMaxContent = false;
            }
            else {
                this.component.vertical.actualSize =
                    this.component.vertical.componentSpace.size;
            }
            if (this.component.horizontal.needLayout ||
                this.component.vertical.needLayout) {
                this.component.notifyNeedLayout();
            }
        }
    }
    HtmlAlign.InBehavior = InBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='PanelBehavior.ts'/>
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class LogicalBehavior extends HtmlAlign.PanelBehavior {
        name = 'logical';
        isLayoutOverridedInArrange = true;
        // para o arrange repassa integralmente o que o componente pai lhe passou
        arrange() {
            if (this.component.horizontal.isNeedMeasureAgain ||
                this.component.vertical.isNeedMeasureAgain) {
                this.component._canInformNeedArrangeInMeasure = false;
                this.component.horizontal.isNeedMeasureAgain = false;
                this.component.vertical.isNeedMeasureAgain = false;
                // nos componentes lógicos apenas o tamanho da dimensão estrela pode ser modificado
                let horizontalSize;
                let verticalSize;
                if (this.component.horizontal.star > 0) {
                    horizontalSize = new HtmlAlign.SizeDelimiter(this.component.horizontal.givedSpace.size, this.component.horizontal.givedSpace.size);
                }
                else {
                    horizontalSize = this.component.horizontal.givedDelimiter;
                }
                if (this.component.vertical.star > 0) {
                    verticalSize = new HtmlAlign.SizeDelimiter(this.component.vertical.givedSpace.size, this.component.vertical.givedSpace.size);
                }
                else {
                    verticalSize = this.component.vertical.givedDelimiter;
                }
                this.component.measure(horizontalSize, verticalSize);
                HtmlAlign.Log.LogicalMeasureAgain++;
            }
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                child.horizontal.givedSpace = this.component.horizontal.givedSpace;
                child.vertical.givedSpace = this.component.vertical.givedSpace;
                child.arrange();
            }
        }
    }
    HtmlAlign.LogicalBehavior = LogicalBehavior;
})(HtmlAlign || (HtmlAlign = {}));
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../Component.ts" />
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../Component.ts" />
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class BodyBehavior extends HtmlAlign.PanelBehavior {
        name = 'body';
        isLayoutOverridedInArrange = false;
        // a medição desse comportamento é diferente, se forem componentes com máximos
        // percentuais respeita o tamanho da tela
        // se não permite que o componente cresça indefinidamente
        measure() {
            const fixedHDelimiter = new HtmlAlign.SizeDelimiter(this.component.horizontal.size.min, this.component.horizontal.size.min);
            const fixedVDelimiter = new HtmlAlign.SizeDelimiter(this.component.vertical.size.min, this.component.vertical.size.min);
            let maxHorizontalContentSize = 0;
            let maxVerticalContentSize = 0;
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                if (child.horizontal.size.maxIsPercent &&
                    child.vertical.size.maxIsPercent) {
                    child.measure(fixedHDelimiter, fixedVDelimiter);
                }
                else if (child.horizontal.size.maxIsPercent ||
                    child.horizontal.size.delimiter > 0) {
                    child.measure(fixedHDelimiter, this.component.vertical.contentDelimiter);
                }
                else if (child.vertical.size.maxIsPercent) {
                    child.measure(this.component.horizontal.contentDelimiter, fixedVDelimiter);
                }
                else {
                    child.measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
                }
                if (maxHorizontalContentSize < child.horizontal.componentRequired) {
                    maxHorizontalContentSize = child.horizontal.componentRequired;
                }
                if (maxVerticalContentSize < child.vertical.componentRequired) {
                    maxVerticalContentSize = child.vertical.componentRequired;
                }
            }
            this.component.horizontal.contentDesired = maxHorizontalContentSize;
            this.component.vertical.contentDesired = maxVerticalContentSize;
        }
        arrange() {
            let needScrollVertical = false;
            let needScrollHorizontal = false;
            if (this.component.vertical.scroll == HtmlAlign.Scroll.auto) {
                const sizeVDesired = this.component.vertical.contentDesired +
                    this.component.vertical.margin.sum() +
                    this.component.vertical.border.sum() +
                    this.component.vertical.padding.sum();
                if (sizeVDesired > this.component.vertical.size.min) {
                    needScrollVertical = true;
                }
            }
            if (this.component.horizontal.scroll == HtmlAlign.Scroll.auto) {
                const sizeHDesired = this.component.horizontal.contentDesired +
                    this.component.horizontal.margin.sum() +
                    this.component.horizontal.border.sum() +
                    this.component.horizontal.padding.sum();
                if (sizeHDesired > this.component.horizontal.size.min) {
                    needScrollHorizontal = true;
                }
            }
            if (needScrollVertical && !needScrollHorizontal) {
                this.component._canInformNeedArrangeInMeasure = false;
                this.component.horizontal.size.min -= 17;
                this.component.measure(HtmlAlign.SizeDelimiter.default(), HtmlAlign.SizeDelimiter.default());
                this.component.horizontal.givedSpace = new HtmlAlign.Space(0, this.component.horizontal.componentRequired);
                this.component.vertical.givedSpace = new HtmlAlign.Space(0, this.component.vertical.componentRequired);
                this.component.horizontal.size.min += 17;
                this.component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            else if (needScrollHorizontal && !needScrollVertical) {
                this.component._canInformNeedArrangeInMeasure = false;
                this.component.vertical.size.min -= 17;
                this.component.measure(HtmlAlign.SizeDelimiter.default(), HtmlAlign.SizeDelimiter.default());
                this.component.horizontal.givedSpace = new HtmlAlign.Space(0, this.component.horizontal.componentRequired);
                this.component.vertical.givedSpace = new HtmlAlign.Space(0, this.component.vertical.componentRequired);
                this.component.vertical.size.min += 17;
                this.component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            else if (needScrollVertical && needScrollVertical) {
                this.component._canInformNeedArrangeInMeasure = false;
                this.component.horizontal.size.min -= 17;
                this.component.vertical.size.min -= 17;
                this.component.measure(HtmlAlign.SizeDelimiter.default(), HtmlAlign.SizeDelimiter.default());
                this.component.horizontal.givedSpace = new HtmlAlign.Space(0, this.component.horizontal.componentRequired);
                this.component.vertical.givedSpace = new HtmlAlign.Space(0, this.component.vertical.componentRequired);
                this.component.horizontal.size.min += 17;
                this.component.vertical.size.min += 17;
                this.component._canInformNeedArrangeInMeasure = true;
                HtmlAlign.Log.RootScrollMeasureAgain++;
            }
            super.arrange();
        }
    }
    HtmlAlign.BodyBehavior = BodyBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class StackCssProperty {
        regExpString = /^\s*(\w*).*$/;
        name = '--stack';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'left';
        }
        setValueFromCssProperty(_valueString, component) {
            const valueString = this.regExpString.exec(_valueString)[1];
            const stackBehavior = component.behavior;
            if (valueString == 'top')
                stackBehavior.Side = HtmlAlign.Side.top;
            else if (valueString == 'right')
                stackBehavior.Side = HtmlAlign.Side.right;
            else if (valueString == 'bottom')
                stackBehavior.Side = HtmlAlign.Side.bottom;
            else
                stackBehavior.Side = HtmlAlign.Side.left;
        }
        getValueStringFromComponent(component) {
            const stackBehavior = component.behavior;
            if (stackBehavior.Side == HtmlAlign.Side.top)
                return 'top';
            else if (stackBehavior.Side == HtmlAlign.Side.right)
                return 'right';
            else if (stackBehavior.Side == HtmlAlign.Side.bottom)
                return 'bottom';
            else
                return 'left';
        }
    }
    HtmlAlign.StackCssProperty = StackCssProperty;
    class StackBehavior {
        name = 'stack';
        component;
        isLayoutOverridedInArrange = false;
        static StackCssProperty = new StackCssProperty();
        getNew() {
            return new StackBehavior();
        }
        getCssProperties() {
            return [StackBehavior.StackCssProperty];
        }
        Side;
        _totalDesiredSizeNotStarInAxis = 0;
        _starCountInAxis = 0;
        measure() {
            let axis = HtmlAlign.Axis.vertical;
            if (this.Side == HtmlAlign.Side.left || this.Side == HtmlAlign.Side.right) {
                axis = HtmlAlign.Axis.horizontal;
            }
            this._starCountInAxis = 0;
            this._totalDesiredSizeNotStarInAxis = 0;
            let maxSizeInAwryAxis = 0;
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                const dimension = child.getOnAxis(axis);
                child.measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
                const awryDimension = child.getPerpendicularToAxis(axis);
                if (awryDimension.componentRequired > maxSizeInAwryAxis) {
                    maxSizeInAwryAxis = awryDimension.componentRequired;
                }
                if (dimension.star > 0) {
                    this._starCountInAxis += dimension.star;
                }
                else {
                    this._totalDesiredSizeNotStarInAxis += dimension.componentRequired;
                }
            }
            this.component.getOnAxis(axis).contentDesired =
                this._totalDesiredSizeNotStarInAxis;
            this.component.getPerpendicularToAxis(axis).contentDesired =
                maxSizeInAwryAxis;
        }
        arrange() {
            let axis = HtmlAlign.Axis.vertical;
            if (this.Side == HtmlAlign.Side.left || this.Side == HtmlAlign.Side.right) {
                axis = HtmlAlign.Axis.horizontal;
            }
            const spaceInAxis = this.component
                .getOnAxis(axis)
                .contentSpace.copy();
            const spacePerpendicularOfAxis = this.component.getPerpendicularToAxis(axis).contentSpace;
            let starPortionSize = 0;
            if (this._starCountInAxis > 0 &&
                spaceInAxis.size > this._totalDesiredSizeNotStarInAxis) {
                starPortionSize =
                    (spaceInAxis.size - this._totalDesiredSizeNotStarInAxis) /
                        this._starCountInAxis;
            }
            if (this.Side == HtmlAlign.Side.left || this.Side == HtmlAlign.Side.top) {
                for (let index = 0; index < this.component.children.length; index++) {
                    const child = this.component.children[index];
                    const dimension = child.getOnAxis(axis);
                    if (dimension.star) {
                        spaceInAxis.size = starPortionSize * dimension.star;
                    }
                    else {
                        spaceInAxis.size = dimension.componentRequired;
                    }
                    dimension.givedSpace = spaceInAxis;
                    child.getPerpendicularToAxis(axis).givedSpace =
                        spacePerpendicularOfAxis;
                    child.arrange();
                    spaceInAxis.displacement += spaceInAxis.size;
                }
            }
            else {
                for (let index = this.component.children.length - 1; index >= 0; index--) {
                    const child = this.component.children[index];
                    const dimension = child.getOnAxis(axis);
                    if (dimension.star) {
                        spaceInAxis.size = starPortionSize;
                    }
                    else {
                        spaceInAxis.size = dimension.componentRequired;
                    }
                    dimension.givedSpace = spaceInAxis;
                    child.getPerpendicularToAxis(axis).givedSpace =
                        spacePerpendicularOfAxis;
                    child.arrange();
                    spaceInAxis.displacement += spaceInAxis.size;
                }
            }
        }
    }
    HtmlAlign.StackBehavior = StackBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class WrapCssProperty {
        regExpString = /^\s*(\w*).*$/;
        name = '--wrap';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'left';
        }
        setValueFromCssProperty(_valueString, component) {
            const valueString = this.regExpString.exec(_valueString)[1];
            const wrapBehavior = component.behavior;
            if (valueString == 'top')
                wrapBehavior._side = HtmlAlign.Side.top;
            else if (valueString == 'right')
                wrapBehavior._side = HtmlAlign.Side.right;
            else if (valueString == 'bottom')
                wrapBehavior._side = HtmlAlign.Side.bottom;
            else
                wrapBehavior._side = HtmlAlign.Side.left;
        }
        getValueStringFromComponent(component) {
            const wrapBehavior = component.behavior;
            if (wrapBehavior._side == HtmlAlign.Side.top)
                return 'top';
            else if (wrapBehavior._side == HtmlAlign.Side.right)
                return 'right';
            else if (wrapBehavior._side == HtmlAlign.Side.bottom)
                return 'bottom';
            else
                return 'left';
        }
    }
    HtmlAlign.WrapCssProperty = WrapCssProperty;
    class WrapBehavior {
        name = 'wrap';
        component;
        isLayoutOverridedInArrange = false;
        static WrapCssProperty = new WrapCssProperty();
        getNew() {
            return new WrapBehavior();
        }
        getCssProperties() {
            return [WrapBehavior.WrapCssProperty];
        }
        _side;
        // auxiliares
        _wrapAxis;
        _lines = [];
        measure() {
            for (let index = 0; index < this.component.children.length; index++) {
                this.component.children[index].measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
            }
            this.ProcessLines(this.component.horizontal.contentDelimiter.max, this.component.vertical.contentDelimiter.max);
            let maxSumOfSizesInAxis = 0;
            let sumOfMaxSizesInReverseAxis = 0;
            for (let index = 0; index < this._lines.length; index++) {
                const wrapLine = this._lines[index];
                if (wrapLine.SumOfSizesInAxis > maxSumOfSizesInAxis) {
                    maxSumOfSizesInAxis = wrapLine.SumOfSizesInAxis;
                }
                sumOfMaxSizesInReverseAxis += wrapLine.MaxSizeInReverseAxis;
            }
            this.component.getOnAxis(this._wrapAxis).contentDesired =
                maxSumOfSizesInAxis;
            this.component.getPerpendicularToAxis(this._wrapAxis).contentDesired =
                sumOfMaxSizesInReverseAxis;
        }
        arrange() {
            const spaceInAxis = this.component
                .getOnAxis(this._wrapAxis)
                .contentSpace.copy();
            const spaceInReverseAxis = this.component
                .getPerpendicularToAxis(this._wrapAxis)
                .contentSpace.copy();
            const spaceInAxisCopy = spaceInAxis.copy();
            for (let lineIndex = 0; lineIndex < this._lines.length; lineIndex++) {
                const line = this._lines[lineIndex];
                spaceInReverseAxis.size = line.MaxSizeInReverseAxis;
                for (let index = 0; index < line.Components.length; index++) {
                    const child = line.Components[index];
                    const componentDesizerdSize = child.getOnAxis(this._wrapAxis).componentRequired;
                    spaceInAxis.size = componentDesizerdSize;
                    child.getOnAxis(this._wrapAxis).givedSpace = spaceInAxis;
                    child.getPerpendicularToAxis(this._wrapAxis).givedSpace =
                        spaceInReverseAxis;
                    child.arrange();
                    spaceInAxis.displacement += componentDesizerdSize;
                }
                spaceInAxis.copyFrom(spaceInAxisCopy);
                spaceInReverseAxis.displacement += line.MaxSizeInReverseAxis;
            }
        }
        ProcessLines(horizontalMax, verticalMax) {
            this._lines = [];
            this._wrapAxis = HtmlAlign.Axis.vertical;
            let maxSizeInAxis = verticalMax;
            if (this._side == HtmlAlign.Side.left || this._side == HtmlAlign.Side.right) {
                this._wrapAxis = HtmlAlign.Axis.horizontal;
                maxSizeInAxis = horizontalMax;
            }
            let currentLine = null;
            if (this._side == HtmlAlign.Side.left || this._side == HtmlAlign.Side.top) {
                for (let index = 0; index < this.component.children.length; index++) {
                    const child = this.component.children[index];
                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
            else {
                for (let index = this.component.children.length - 1; index >= 0; index--) {
                    const child = this.component.children[index];
                    if (currentLine == null || !currentLine.Add(child)) {
                        currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
                        this._lines.push(currentLine);
                    }
                }
            }
        }
    }
    HtmlAlign.WrapBehavior = WrapBehavior;
    class WrapLine {
        WrapAxis;
        MaxSizeInAxis;
        SumOfSizesInAxis;
        MaxSizeInReverseAxis;
        Components;
        constructor(WrapAxis, MaxSizeInAxis, component) {
            this.WrapAxis = WrapAxis;
            this.MaxSizeInAxis = MaxSizeInAxis;
            // Se é o primeiro elemento da linha não importa o tamanho dele, ele ficará nessa linha
            this.SumOfSizesInAxis = component.getOnAxis(this.WrapAxis).componentRequired;
            this.MaxSizeInReverseAxis = component.getPerpendicularToAxis(this.WrapAxis).componentRequired;
            this.Components = [];
            this.Components.push(component);
        }
        Add(component) {
            const sizeInAxis = component.getOnAxis(this.WrapAxis).componentRequired;
            const sizeInReverseAxis = component.getPerpendicularToAxis(this.WrapAxis).componentRequired;
            // Se a adição do componente a essa linha faz com que o tamanho extrapole
            // o tamanho máximo esse componente não será inserido nessa linha
            if (Math.fround(this.SumOfSizesInAxis + sizeInAxis) >
                Math.fround(this.MaxSizeInAxis)) {
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
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class DockCssProperty {
        regExpString = /^\s*(\w*).*$/;
        name = '--dock';
        context = HtmlAlign.CssPropertyContext.child;
        defaultValue() {
            return 'left';
        }
        setValueFromCssProperty(_valueString, component) {
            const valueString = this.regExpString.exec(_valueString)[1];
            if (valueString == 'top')
                component.parentAttached['Side'] = HtmlAlign.Side.top;
            else if (valueString == 'right')
                component.parentAttached['Side'] = HtmlAlign.Side.right;
            else if (valueString == 'bottom')
                component.parentAttached['Side'] = HtmlAlign.Side.bottom;
            else if (valueString == 'left')
                component.parentAttached['Side'] = HtmlAlign.Side.left;
            else
                component.parentAttached['Side'] = HtmlAlign.Side.all;
        }
        getValueStringFromComponent(component) {
            if (component.parentAttached['Side'] == HtmlAlign.Side.top)
                return 'top';
            else if (component.parentAttached['Side'] == HtmlAlign.Side.right)
                return 'right';
            else if (component.parentAttached['Side'] == HtmlAlign.Side.bottom)
                return 'bottom';
            else if (component.parentAttached['Side'] == HtmlAlign.Side.left)
                return 'left';
            else
                return 'fit';
        }
    }
    HtmlAlign.DockCssProperty = DockCssProperty;
    class DockBehavior {
        name = 'dock';
        component;
        isLayoutOverridedInArrange = false;
        static DockCssPropery = new DockCssProperty();
        getNew() {
            return new DockBehavior();
        }
        getCssProperties() {
            return [DockBehavior.DockCssPropery];
        }
        measure() {
            const totalSumRect = HtmlAlign.Rect.default();
            const desiredRect = HtmlAlign.Rect.default();
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                child.measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
                let axis = HtmlAlign.Axis.vertical;
                if (child.parentAttached['Side'] == HtmlAlign.Side.left ||
                    child.parentAttached['Side'] == HtmlAlign.Side.right) {
                    axis = HtmlAlign.Axis.horizontal;
                }
                totalSumRect.setOnAxis(axis, totalSumRect.getOnAxis(axis) + child.getOnAxis(axis).componentRequired);
                if (desiredRect.getOnAxis(axis) < totalSumRect.getOnAxis(axis)) {
                    desiredRect.setOnAxis(axis, totalSumRect.getOnAxis(axis));
                }
                const maxInAwryAxis = child.getPerpendicularToAxis(axis).componentRequired +
                    totalSumRect.getPerpendicularToAxis(axis);
                if (desiredRect.getPerpendicularToAxis(axis) < maxInAwryAxis) {
                    desiredRect.setPerpendicularToAxis(axis, maxInAwryAxis);
                }
                if (child.parentAttached['Side'] == HtmlAlign.Side.all) {
                    break;
                }
            }
            this.component.horizontal.contentDesired = desiredRect.horizontal;
            this.component.vertical.contentDesired = desiredRect.vertical;
        }
        arrange() {
            const sizeRect = new HtmlAlign.Rect(this.component.horizontal.contentSpace.size, this.component.vertical.contentSpace.size);
            const displacementRect = new HtmlAlign.Rect(this.component.horizontal.contentSpace.displacement, this.component.vertical.contentSpace.displacement);
            let clearNext = false;
            for (let index = 0; index < this.component.children.length; index++) {
                const child = this.component.children[index];
                if (clearNext) {
                    child.horizontal.givedSpace = HtmlAlign.Space.default();
                    child.vertical.givedSpace = HtmlAlign.Space.default();
                    child.arrange();
                    continue;
                }
                if (child.parentAttached['Side'] == HtmlAlign.Side.all) {
                    child.horizontal.givedSpace = new HtmlAlign.Space(displacementRect.horizontal, sizeRect.horizontal);
                    child.vertical.givedSpace = new HtmlAlign.Space(displacementRect.vertical, sizeRect.vertical);
                    child.arrange();
                    clearNext = true;
                    continue;
                }
                let axis = HtmlAlign.Axis.vertical;
                if (child.parentAttached['Side'] == HtmlAlign.Side.left ||
                    child.parentAttached['Side'] == HtmlAlign.Side.right) {
                    axis = HtmlAlign.Axis.horizontal;
                }
                let sizeInAxis = child.getOnAxis(axis).componentRequired;
                if (sizeInAxis >= sizeRect.getOnAxis(axis)) {
                    sizeInAxis = sizeRect.getOnAxis(axis);
                    clearNext = true;
                }
                if (!clearNext &&
                    (child.parentAttached['Side'] == HtmlAlign.Side.right ||
                        child.parentAttached['Side'] == HtmlAlign.Side.bottom)) {
                    child.getOnAxis(axis).givedSpace = new HtmlAlign.Space(displacementRect.getOnAxis(axis) +
                        sizeRect.getOnAxis(axis) -
                        sizeInAxis, sizeInAxis);
                }
                else {
                    child.getOnAxis(axis).givedSpace = new HtmlAlign.Space(displacementRect.getOnAxis(axis), sizeInAxis);
                    displacementRect.setOnAxis(axis, displacementRect.getOnAxis(axis) + sizeInAxis);
                }
                child.getPerpendicularToAxis(axis).givedSpace = new HtmlAlign.Space(displacementRect.getPerpendicularToAxis(axis), sizeRect.getPerpendicularToAxis(axis));
                sizeRect.setOnAxis(axis, sizeRect.getOnAxis(axis) - sizeInAxis);
                child.arrange();
            }
        }
    }
    HtmlAlign.DockBehavior = DockBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class GridCssProperty {
        name = '--grid';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return '*, *';
        }
        setValueFromCssProperty(valueString, component) {
            const regexValidateGrid = /^(\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+\s*[,](\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+.*$/;
            const regexGrid = /\s*((\d*[.]?\d*)([%]?)([~*])(\d*[.]?\d*)([%]?))|(\d+[.]?\d*)([%]?)|([,])/g;
            const gridBehavior = component.behavior;
            // verfica se a string está bem formada, se não estiver deixa os valores padrões e retorna
            if (!regexValidateGrid.test(valueString)) {
                gridBehavior.Columns = [HtmlAlign.SizeRange.default()];
                gridBehavior.Rows = [HtmlAlign.SizeRange.default()];
                return;
            }
            gridBehavior.Columns = [];
            gridBehavior.Rows = [];
            let matchs;
            let rows = false;
            while ((matchs = regexGrid.exec(valueString))) {
                // verifica se modificou as declarações de colunas para linhas
                if (matchs[9] == ',') {
                    // indica que tinha mais de uma , então para a leitura
                    if (rows) {
                        break;
                    }
                    rows = true;
                    continue;
                }
                let sizeRange;
                // se tem um valor único e não um espaço de values
                if (matchs[7] != undefined) {
                    const value = parseInt(matchs[7]);
                    const isPercent = matchs[8] == '%';
                    sizeRange = new HtmlAlign.SizeRange(0, 0, value, isPercent, value, isPercent);
                }
                // se for estrela ou tiver um espaço de valores
                else {
                    const min = matchs[2];
                    const minIsPercent = matchs[3];
                    const type = matchs[4];
                    const max = matchs[5];
                    const maxIsPercent = matchs[6];
                    if (!type && !min && min != '0') {
                        sizeRange = HtmlAlign.SizeRange.default();
                    }
                    else if (type == '~') {
                        sizeRange = new HtmlAlign.SizeRange(0, 0, parseFloat(min) || 0, minIsPercent, parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
                    }
                    else if (type == '*') {
                        sizeRange = new HtmlAlign.SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
                    }
                    else if (min == '0') {
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
                gridBehavior.Columns = [HtmlAlign.SizeRange.default()];
            }
            // se não tem linhas colca o valor default
            if (gridBehavior.Rows.length == 0) {
                gridBehavior.Rows = [HtmlAlign.SizeRange.default()];
            }
        }
        getValueStringFromComponent(component) {
            const gridBehavior = component.behavior;
            let valueString = '';
            for (let index = 0; index < gridBehavior.Columns.length; index++) {
                valueString += ' ' + gridBehavior.Columns[index].toString();
            }
            valueString += ',';
            for (let index = 0; index < gridBehavior.Rows.length; index++) {
                valueString += ' ' + gridBehavior.Rows[index].toString();
            }
            return valueString;
        }
    }
    HtmlAlign.GridCssProperty = GridCssProperty;
    class GridPlaceCssProperty {
        regExpPlace = /^\s*(\d*)\s*(\d*).*$/;
        name = '--place';
        context = HtmlAlign.CssPropertyContext.child;
        defaultValue() {
            return '0 0';
        }
        setValueFromCssProperty(valueString, component) {
            const matchs = this.regExpPlace.exec(valueString);
            if (matchs[1] != undefined) {
                component.parentAttached['Column'] = parseInt(matchs[1]);
            }
            else {
                component.parentAttached['Column'] = 0;
            }
            if (matchs[2] != undefined) {
                component.parentAttached['Row'] = parseInt(matchs[2]);
            }
            else {
                component.parentAttached['Row'] = 0;
            }
        }
        getValueStringFromComponent(component) {
            return (component.parentAttached['Column'] +
                ' ' +
                component.parentAttached['Row']);
        }
    }
    HtmlAlign.GridPlaceCssProperty = GridPlaceCssProperty;
    class GridBehavior {
        name = 'grid';
        component;
        isLayoutOverridedInArrange = false;
        static GridCssProperty = new GridCssProperty();
        static GridPlaceCssProperty = new GridPlaceCssProperty();
        getNew() {
            return new GridBehavior();
        }
        getCssProperties() {
            return [GridBehavior.GridCssProperty, GridBehavior.GridPlaceCssProperty];
        }
        Columns;
        Rows;
        _places;
        _columnsMaxSizes;
        _rowsMaxSizes;
        _columnStarCount;
        _rowStarCount;
        _totalColumnDesiredSizeNotStar;
        _totalRowDesiredSizeNotStar;
        measure() {
            this._places = [];
            this._columnsMaxSizes = [];
            this._rowsMaxSizes = [];
            this._columnStarCount = 0;
            this._rowStarCount = 0;
            this._totalColumnDesiredSizeNotStar = 0;
            this._totalRowDesiredSizeNotStar = 0;
            for (let indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                this._rowsMaxSizes.push(0);
                if (this.Rows[indexRow].star > 0) {
                    this._rowStarCount += this.Rows[indexRow].star;
                }
            }
            for (let indexColumn = 0; indexColumn < this.Columns.length; indexColumn++) {
                this._columnsMaxSizes.push(0);
                if (this.Columns[indexColumn].star > 0) {
                    this._columnStarCount += this.Columns[indexColumn].star;
                }
                for (let indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                    const place = new HtmlAlign.Component(this.component, undefined);
                    place.horizontal.size = this.Columns[indexColumn];
                    place.vertical.size = this.Rows[indexRow];
                    for (let indexChild = 0; indexChild < this.component.children.length; indexChild++) {
                        const child = this.component.children[indexChild];
                        if (child.parentAttached['Column'] == indexColumn &&
                            child.parentAttached['Row'] == indexRow) {
                            place.children.push(child);
                        }
                    }
                    this._places.push(place);
                    if (place.horizontal.star == 0 || place.vertical.star == 0) {
                        place.measure(this.component.horizontal.contentDelimiter, this.component.vertical.contentDelimiter);
                        if (place.horizontal.star == 0 &&
                            place.horizontal.componentRequired >
                                this._columnsMaxSizes[indexColumn]) {
                            this._columnsMaxSizes[indexColumn] =
                                place.horizontal.componentRequired;
                        }
                        if (place.vertical.star == 0 &&
                            place.vertical.componentRequired > this._rowsMaxSizes[indexRow]) {
                            this._rowsMaxSizes[indexRow] = place.vertical.componentRequired;
                        }
                    }
                }
                this._totalColumnDesiredSizeNotStar +=
                    this._columnsMaxSizes[indexColumn];
            }
            for (let indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                this._totalRowDesiredSizeNotStar += this._rowsMaxSizes[indexRow];
            }
            this.component.horizontal.contentDesired =
                this._totalColumnDesiredSizeNotStar;
            this.component.vertical.contentDesired = this._totalRowDesiredSizeNotStar;
        }
        arrange() {
            if (this._columnStarCount > 0 &&
                this.component.horizontal.componentSpace.size >
                    this._totalColumnDesiredSizeNotStar) {
                const columnStarProportion = (this.component.horizontal.componentSpace.size -
                    this._totalColumnDesiredSizeNotStar) /
                    this._columnStarCount;
                for (let indexColumn = 0; indexColumn < this.Columns.length; indexColumn++) {
                    if (this.Columns[indexColumn].star > 0) {
                        this._columnsMaxSizes[indexColumn] =
                            columnStarProportion * this.Columns[indexColumn].star;
                    }
                }
            }
            if (this._rowStarCount > 0 &&
                this.component.vertical.componentSpace.size >
                    this._totalRowDesiredSizeNotStar) {
                const rowStarProportion = (this.component.vertical.componentSpace.size -
                    this._totalRowDesiredSizeNotStar) /
                    this._rowStarCount;
                for (let indexRow = 0; indexRow < this.Rows.length; indexRow++) {
                    if (this.Rows[indexRow].star > 0) {
                        this._rowsMaxSizes[indexRow] =
                            rowStarProportion * this.Rows[indexRow].star;
                    }
                }
            }
            const quantityOfRows = this._rowsMaxSizes.length;
            let rowPostion = 0;
            let rowDisplacement = 0;
            let rowSize = 0;
            let columnPosition = -1;
            let columnDisplacement = 0;
            let columnSize = 0;
            for (let indexPlace = 0; indexPlace < this._places.length; indexPlace++) {
                const place = this._places[indexPlace];
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
                place.horizontal.givedSpace = new HtmlAlign.Space(this.component.horizontal.contentSpace.displacement +
                    columnDisplacement, columnSize);
                place.vertical.givedSpace = new HtmlAlign.Space(this.component.vertical.contentSpace.displacement + rowDisplacement, rowSize);
                place.arrange();
            }
        }
    }
    HtmlAlign.GridBehavior = GridBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
// [TODO] implementação parcial, o correto será interpretar e propagar os valores de transform
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class FitCssProperty {
        regExpString = /^\s*(\w*).*$/;
        name = '--fit';
        context = HtmlAlign.CssPropertyContext.component;
        defaultValue() {
            return 'uniform';
        }
        setValueFromCssProperty(_valueString, component) {
            const valueString = this.regExpString.exec(_valueString)[1];
            const fitBehavior = component.behavior;
            if (valueString == 'fit')
                fitBehavior.Fit = HtmlAlign.Fit.fit;
            else if (valueString == 'horizontal')
                fitBehavior.Fit = HtmlAlign.Fit.horizontal;
            else if (valueString == 'vertical')
                fitBehavior.Fit = HtmlAlign.Fit.vertical;
            else
                fitBehavior.Fit = HtmlAlign.Fit.uniform;
        }
        getValueStringFromComponent(component) {
            const fitBehavior = component.behavior;
            if (fitBehavior.Fit == HtmlAlign.Fit.fit)
                return 'fit';
            else if (fitBehavior.Fit == HtmlAlign.Fit.horizontal)
                return 'horizontal';
            else if (fitBehavior.Fit == HtmlAlign.Fit.vertical)
                return 'vertical';
            else
                return 'uniform';
        }
    }
    HtmlAlign.FitCssProperty = FitCssProperty;
    class FitBehavior extends HtmlAlign.PanelBehavior {
        name = 'fit';
        isLayoutOverridedInArrange = true;
        static FitCssProperty = new FitCssProperty();
        getNew() {
            return new FitBehavior();
        }
        getCssProperties() {
            return [FitBehavior.FitCssProperty];
        }
        Fit;
        measure() {
            const value = this.component.element.style.getPropertyValue('transform');
            this.OnDispose();
            super.measure();
            this.component.element.style.setProperty('transform', value);
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.component.element['laststyle'] =
                this.component.element.getAttribute('style');
        }
        arrange() {
            super.arrange();
            // se o espaço determinado para o componente foi modificado ele precisará
            // atualizar o layout
            let width = this.component.horizontal.componentSpace.size;
            let height = this.component.vertical.componentSpace.size;
            if (width < 0) {
                width = 0;
            }
            if (height < 0) {
                height = 0;
            }
            this.component.element.style.width = width + 'px';
            this.component.element.style.left =
                this.component.horizontal.componentSpace.displacement + 'px';
            this.component.element.style.height = height + 'px';
            this.component.element.style.top =
                this.component.vertical.componentSpace.displacement + 'px';
            let uniformWidth = this.component.parent.horizontal.contentSpace.size /
                this.component.horizontal.componentDesired;
            let uniformHeight = this.component.parent.vertical.contentSpace.size /
                this.component.vertical.componentDesired;
            let transformOriginH = 0;
            let transformOriginV = 0;
            if (this.component.horizontal.align == HtmlAlign.Align.center) {
                transformOriginH = this.component.horizontal.componentRequired / 2;
            }
            else if (this.component.horizontal.align == HtmlAlign.Align.end) {
                transformOriginH = this.component.horizontal.componentRequired;
            }
            else if (this.component.horizontal.align == HtmlAlign.Align.streach) {
                uniformWidth = 1;
            }
            if (this.component.vertical.align == HtmlAlign.Align.center) {
                transformOriginV = this.component.vertical.componentRequired / 2;
            }
            else if (this.component.vertical.align == HtmlAlign.Align.end) {
                transformOriginV = this.component.vertical.componentRequired;
            }
            else if (this.component.vertical.align == HtmlAlign.Align.streach) {
                uniformHeight = 1;
            }
            this.component.element.style.transformOrigin =
                transformOriginH + 'px ' + transformOriginV + 'px';
            if (this.Fit == HtmlAlign.Fit.uniform) {
                this.component.element.style.transform =
                    'scale(' + Math.min(uniformWidth, uniformHeight) + ')';
            }
            else if (this.Fit == HtmlAlign.Fit.fit) {
                this.component.element.style.transform =
                    'scale(' + uniformWidth + ',' + uniformHeight + ')';
            }
            else if (this.Fit == HtmlAlign.Fit.horizontal) {
                this.component.element.style.transform = 'scale(' + uniformWidth + ')';
            }
            else if (this.Fit == HtmlAlign.Fit.vertical) {
                this.component.element.style.transform = 'scale(' + uniformHeight + ')';
            }
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.component.element['laststyle'] =
                this.component.element.getAttribute('style');
        }
        OnDispose() {
            this.component.element.style.removeProperty('transform');
            // armazena o último valor do atributo style para o MutationObserver não disparar uma atualização
            this.component.element['laststyle'] =
                this.component.element.getAttribute('style');
        }
    }
    HtmlAlign.FitBehavior = FitBehavior;
})(HtmlAlign || (HtmlAlign = {}));
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Component.ts'/>
/// <reference path='behaviors/PanelBehavior.ts' />
/// <reference path='behaviors/InBehavior.ts' />
/// <reference path='behaviors/LogicalBehavior.ts' />
/// <reference path='behaviors/BodyBehavior.ts' />
/// <reference path='behaviors/StackBehavior.ts' />
/// <reference path='behaviors/WrapBehavior.ts' />
/// <reference path='behaviors/DockBehavior.ts' />
/// <reference path='behaviors/GridBehavior.ts' />
/// <reference path='behaviors/FitBehavior.ts' />
// eslint-disable-next-line @typescript-eslint/no-namespace
var HtmlAlign;
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='Component.ts'/>
/// <reference path='behaviors/PanelBehavior.ts' />
/// <reference path='behaviors/InBehavior.ts' />
/// <reference path='behaviors/LogicalBehavior.ts' />
/// <reference path='behaviors/BodyBehavior.ts' />
/// <reference path='behaviors/StackBehavior.ts' />
/// <reference path='behaviors/WrapBehavior.ts' />
/// <reference path='behaviors/DockBehavior.ts' />
/// <reference path='behaviors/GridBehavior.ts' />
/// <reference path='behaviors/FitBehavior.ts' />
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (HtmlAlign) {
    class CssPropertyEntry {
        behaviorName;
        cssProperty;
        constructor(behaviorName, cssProperty) {
            this.behaviorName = behaviorName;
            this.cssProperty = cssProperty;
        }
    }
    class System {
        #behaviors = [];
        #cssPropertyEntry = [];
        #root;
        #baseStyleElement;
        _notifyChildrenChangedList = [];
        _notifyCssPropertyChangedList = [];
        _cancelNextRefreshByMeasure = false;
        maxContentString = 'max-content';
        constructor() {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                this.maxContentString = '-moz-max-content';
            }
            // inicializa os comportamentos padrões
            this.registerBehavior(new HtmlAlign.PanelBehavior());
            this.registerBehavior(new HtmlAlign.InBehavior());
            this.registerBehavior(new HtmlAlign.StackBehavior());
            this.registerBehavior(new HtmlAlign.WrapBehavior());
            this.registerBehavior(new HtmlAlign.DockBehavior());
            this.registerBehavior(new HtmlAlign.GridBehavior());
            this.registerBehavior(new HtmlAlign.FitBehavior());
            this.refreshBaseStyle();
        }
        #processoChanges() {
            this._cancelNextRefreshByMeasure = true;
            const _qtdChildrenChanged = this._notifyChildrenChangedList.length;
            const _qtdCssPropertiesChanged = this._notifyCssPropertyChangedList.length;
            for (let i = 0; i < _qtdChildrenChanged; i++) {
                this._notifyChildrenChangedList[i].notifyChildrenChanged();
            }
            for (let i = 0; i < _qtdCssPropertiesChanged; i++) {
                this._notifyCssPropertyChangedList[i].notifyCssPropertiesChanged();
            }
            this._notifyChildrenChangedList.splice(0, _qtdChildrenChanged);
            this._notifyCssPropertyChangedList.splice(0, _qtdCssPropertiesChanged);
            this._cancelNextRefreshByMeasure = false;
        }
        refreshBaseStyle() {
            const cssList = [];
            const behaviorNameList = [];
            const panelDefaultValuesList = [];
            for (let index = 0; index < this.#behaviors.length; index++) {
                behaviorNameList.push(this.#behaviors[index].name);
            }
            behaviorNameList.push('body');
            behaviorNameList.push('*[in]');
            panelDefaultValuesList.push('box-sizing:border-box');
            panelDefaultValuesList.push('position:absolute');
            const panelCssProperties = this.#behaviors[0].getCssProperties();
            for (let index = 0; index < panelCssProperties.length; index++) {
                const panelCssProperty = panelCssProperties[index];
                const defaultValue = panelCssProperty.defaultValue();
                if (defaultValue != null) {
                    panelDefaultValuesList.push(panelCssProperty.name + ':' + defaultValue);
                }
            }
            cssList.push(behaviorNameList.join(',') +
                '{' +
                panelDefaultValuesList.join(';') +
                '}');
            for (let index = 2; index < this.#behaviors.length; index++) {
                const behavior = this.#behaviors[index];
                const behaviorCssProperties = behavior.getCssProperties();
                const behaviorComponentCssList = [];
                const behaviorChildCssList = [];
                behaviorComponentCssList.push('--behavior:' + behavior.name);
                for (let indexCssProperty = 0; indexCssProperty < behaviorCssProperties.length; indexCssProperty++) {
                    const behaviorCssProperty = behaviorCssProperties[indexCssProperty];
                    const defaultValue = behaviorCssProperty.defaultValue();
                    if (defaultValue != null) {
                        if (behaviorCssProperty.context == HtmlAlign.CssPropertyContext.component) {
                            behaviorComponentCssList.push(behaviorCssProperty.name + ':' + defaultValue);
                        }
                        else {
                            behaviorChildCssList.push(behaviorCssProperty.name + ':' + defaultValue);
                        }
                    }
                }
                cssList.push(behavior.name + '{' + behaviorComponentCssList.join(';') + '}');
                if (behaviorChildCssList.length > 0) {
                    cssList.push(behavior.name + '>*{' + behaviorChildCssList.join(';') + '}');
                }
            }
            cssList.push('body{overflow:auto;margin:0}');
            cssList.push('in,*[in]{--behavior:in;width:' +
                this.maxContentString +
                ';height:' +
                this.maxContentString +
                ';}');
            if (this.#baseStyleElement) {
                document.head.removeChild(this.#baseStyleElement);
            }
            this.#baseStyleElement = document.createElement('style');
            this.#baseStyleElement.appendChild(document.createTextNode(cssList.join('\n')));
            if (document.head.firstChild) {
                document.head.insertBefore(this.#baseStyleElement, document.head.firstChild);
            }
            else {
                document.head.appendChild(this.#baseStyleElement);
            }
            if (this.#root) {
                this.forceRereadAllCssProperties(this.#root);
            }
        }
        init() {
            const horizontalSize = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            const verticalSize = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            // inicializa o componente raiz
            // adiciona um componente pai ao componente raiz
            // esse componente será o finalizador da propagação de notificação de atualização
            const rootParent = { behavior: {} };
            rootParent.notifyNeedMeasure = function () {
                HtmlAlign.Log.RootMeasuresNotified++;
                if (this._cancelNextRefreshByMeasure) {
                    this._cancelNextRefreshByMeasure = false;
                }
                else {
                    setTimeout(refreshLayout, 4);
                }
            };
            rootParent.notifyNeedArrange = rootParent.notifyChildNeedArrange =
                function () {
                    HtmlAlign.Log.RootArrangesNotified++;
                };
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            rootParent.notifyChildNeedLayout = function () { };
            this.#root = new HtmlAlign.Component(rootParent, document.body);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this.#root.processCssPropertiesChanged = function () { };
            document.body['component'] = this.#root;
            this.#root.horizontal.size.min = horizontalSize;
            this.#root.vertical.size.min = verticalSize;
            this.executeRefreshLayout();
        }
        executeRefreshLayout() {
            this.#processoChanges();
            this.#root.measure(HtmlAlign.SizeDelimiter.default(), HtmlAlign.SizeDelimiter.default());
            this.#root.horizontal.givedSpace = new HtmlAlign.Space(0, this.#root.horizontal.componentRequired);
            this.#root.vertical.givedSpace = new HtmlAlign.Space(0, this.#root.vertical.componentRequired);
            this.#root.arrange();
            this.#root.processLayout();
        }
        refreshValuesFromCssProperties(component) {
            const css = window.getComputedStyle(component.element);
            for (let index = 0; index < this.#cssPropertyEntry.length; index++) {
                const entry = this.#cssPropertyEntry[index];
                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.behaviorName == 'panel' ||
                    // busca os atributos do behavior corrente
                    (entry.cssProperty.context === HtmlAlign.CssPropertyContext.component &&
                        component.behavior.name === entry.behaviorName) ||
                    // busca os atributos adicionados aos filhos do comportamento
                    (entry.cssProperty.context === HtmlAlign.CssPropertyContext.child &&
                        component.parent.behavior.name === entry.behaviorName)) {
                    entry.cssProperty.setValueFromCssProperty(css.getPropertyValue(entry.cssProperty.name), component);
                }
            }
            HtmlAlign.Log.ReadedCssProperties++;
        }
        refreshRootSize() {
            this.#root.horizontal.size.min = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            this.#root.vertical.size.min = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            this.#root.notifyNeedMeasure();
            refreshLayout();
        }
        registerBehavior(behavior) {
            this.#behaviors.push(behavior);
            const behaviorCssProperties = behavior.getCssProperties();
            if (behaviorCssProperties != null) {
                for (let index = 0; index < behaviorCssProperties.length; index++) {
                    this.#cssPropertyEntry.push(new CssPropertyEntry(behavior.name, behaviorCssProperties[index]));
                }
            }
        }
        isBehavior(element) {
            if (element.tagName == undefined) {
                return false;
            }
            const name = element.tagName.toLowerCase();
            for (let index = 0; index < this.#behaviors.length; index++) {
                if (this.#behaviors[index].name == name) {
                    return true;
                }
            }
            if (element.attributes['in']) {
                return true;
            }
            return false;
        }
        getBehavior(component, behaviorName) {
            if (component.element.tagName === 'BODY') {
                return new HtmlAlign.BodyBehavior();
            }
            for (let index = 0; index < this.#behaviors.length; index++) {
                const behavior = this.#behaviors[index];
                if (behavior.name == behaviorName) {
                    return behavior.getNew();
                }
            }
            return null;
        }
        getBehaviorName(component) {
            if (component.behavior != undefined) {
                return component.behavior.name;
            }
        }
        _verifyStyleSheetChanged(refreshValuesFirst) {
            if (refreshValuesFirst) {
                this._verifyStyleSheetChangedComponent(this.#root, true);
            }
            this._verifyStyleSheetChangedComponent(this.#root, false);
        }
        _verifyStyleSheetChangedComponent(component, refreshValuesFirst) {
            const computed = window.getComputedStyle(component.element);
            let cssText = '';
            for (let index = 0; index < this.#cssPropertyEntry.length; index++) {
                const entry = this.#cssPropertyEntry[index];
                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.behaviorName === 'panel' ||
                    // busca os atributos do behavior corrente
                    (entry.cssProperty.context == HtmlAlign.CssPropertyContext.component &&
                        component.behavior.name == entry.behaviorName) ||
                    // busca os atributos adicionados aos filhos do comportamento
                    (entry.cssProperty.context == HtmlAlign.CssPropertyContext.child &&
                        component.parent.behavior.name == entry.behaviorName)) {
                    cssText += computed.getPropertyValue(entry.cssProperty.name);
                }
            }
            if (component.parentAttached['lastCssText'] == undefined ||
                refreshValuesFirst) {
                component.parentAttached['lastCssText'] = cssText;
            }
            else if (component.parentAttached['lastCssText'] != cssText) {
                component.parentAttached['lastCssText'] = cssText;
                component.notifyCssPropertiesChanged();
            }
            for (let index = 0; index < component.children.length; index++) {
                this._verifyStyleSheetChangedComponent(component.children[index], refreshValuesFirst);
            }
        }
        forceRereadAllCssProperties(component) {
            component.notifyCssPropertiesChanged();
            for (let index = 0; index < component.children.length; index++) {
                this.forceRereadAllCssProperties(component.children[index]);
            }
        }
    }
    HtmlAlign.Layout = new System();
    let _waitingToRefresh = false;
    let _inRefreshingProcess = false;
    let _hasRefreshGuarantee = false;
    function refreshLayout() {
        if (!_waitingToRefresh && !_hasRefreshGuarantee) {
            _waitingToRefresh = true;
            _refreshProtection();
        }
        else if (_inRefreshingProcess && !_hasRefreshGuarantee) {
            _hasRefreshGuarantee = true;
            requestAnimationFrame(_refreshGuarantee);
        }
    }
    HtmlAlign.refreshLayout = refreshLayout;
    // eslint-disable-next-line no-inner-declarations
    function _refreshGuarantee() {
        _hasRefreshGuarantee = false;
        refreshLayout();
    }
    // eslint-disable-next-line no-inner-declarations
    function _refreshProtection() {
        if (!_inRefreshingProcess) {
            _inRefreshingProcess = true;
            _refresh();
        }
    }
    // eslint-disable-next-line no-inner-declarations
    function _refresh() {
        try {
            HtmlAlign.Layout.executeRefreshLayout();
            HtmlAlign.Log.LayoutRefreshed++;
        }
        catch (ex) {
            console.log('Erro em _refreshArrange');
            console.log(ex);
        }
        finally {
            _inRefreshingProcess = false;
            _waitingToRefresh = false;
        }
    }
    let _isVerifyingStyleSheet = true;
    // eslint-disable-next-line no-inner-declarations
    function _verifyStyleSheetWorker() {
        const _isDevToolsOpen = isDevToolsOpen();
        if (HtmlAlign.Config.VerifyStyleSheetPeriodicaly ||
            (_isDevToolsOpen && HtmlAlign.Config.IfDevToolsOpenRefresh)) {
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
    let _lastStateDevTools = false;
    // eslint-disable-next-line no-inner-declarations
    function isDevToolsOpen() {
        const threshold = HtmlAlign.Config.DevToolsTreshhold;
        const widthThreshold = window.outerWidth - window.innerWidth * window.devicePixelRatio >
            threshold;
        const heightThreshold = window.outerHeight - window.innerHeight * window.devicePixelRatio >
            threshold;
        if (!(heightThreshold && widthThreshold) &&
            ((window['Firebug'] &&
                window['Firebug'].chrome &&
                window['Firebug'].chrome.isInitialized) ||
                widthThreshold ||
                heightThreshold)) {
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
    const observer = new MutationObserver((mutations, observer) => {
        const qtdList = mutations.length;
        for (let indexRecord = 0; indexRecord < qtdList; indexRecord++) {
            const mutationRecord = mutations[indexRecord];
            // se foi uma atualização de texto ou de uma tag que não implementa nenhum comportamento
            // é feita uma pesquisa subindo na árvore DOM por qual é o primeiro componente pai em que
            // essa atualização está contida, se esse componente é um conteúdo é disparada uma rotina
            // de medida para verificar se o conteúdo necessita de um novo espaço para si
            if (mutationRecord.type == 'characterData' ||
                !mutationRecord.target['component']) {
                let element = mutationRecord.target;
                while (element) {
                    if (element['component']) {
                        const component = element['component'];
                        if (component.behavior.name === 'in') {
                            HtmlAlign.Layout._notifyCssPropertyChangedList.push(component);
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
                const component = mutationRecord.target['component'];
                if (mutationRecord.attributeName) {
                    const element = mutationRecord.target;
                    // se o componente estiver congelado ou a atualização ocorreu no atributo style mas refere-se
                    // apenas a atualização de posição conhecida não deve ser disparado uma medida
                    if (mutationRecord.attributeName === 'style' &&
                        element['laststyle'] === element.getAttribute('style')) {
                        continue;
                    }
                    HtmlAlign.Layout._notifyCssPropertyChangedList.push(component);
                }
                for (let index = 0; index < mutationRecord.removedNodes.length; index++) {
                    HtmlAlign.Layout._notifyChildrenChangedList.push(component);
                }
                // possível melhora, os elementos aparecem duplicados na lista
                for (let index = 0; index < mutationRecord.addedNodes.length; index++) {
                    HtmlAlign.Layout._notifyChildrenChangedList.push(component);
                }
            }
        }
        if (HtmlAlign.Layout._notifyChildrenChangedList.length > 0 ||
            HtmlAlign.Layout._notifyCssPropertyChangedList.length > 0) {
            requestAnimationFrame(refreshLayout);
        }
    });
    // eslint-disable-next-line no-inner-declarations
    function _init() {
        // realiza a primeira rotina de medição e arranjo
        HtmlAlign.Layout.init();
        // inicia o observador de mudanças nos elementos
        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });
        // inicializa o verificador de update
        requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, 2000));
        window.addEventListener('resize', function () {
            HtmlAlign.Layout.refreshRootSize();
        });
    }
    console.log('executing');
    if (document.readyState === 'complete') {
        console.log('init by complete');
        _init();
    }
    else {
        window.addEventListener('load', function () {
            console.log('init by load');
            _init();
        });
    }
    // configurações
    HtmlAlign.Config = {
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
        print: function () {
            console.log('LayoutRefreshed: ' +
                HtmlAlign.Log.LayoutRefreshed.toString() +
                ';\nReadedCssProperties: ' +
                HtmlAlign.Log.ReadedCssProperties.toString() +
                ';\nAddedElements: ' +
                HtmlAlign.Log.AddedElements.toString() +
                ';\nRemovedElements: ' +
                HtmlAlign.Log.RemovedElements.toString() +
                ';\nRootMeasuresNotified: ' +
                HtmlAlign.Log.RootMeasuresNotified.toString() +
                ';\nRootScrollRemeasure: ' +
                HtmlAlign.Log.RootScrollMeasureAgain.toString() +
                ';\nLogicalRemeasure: ' +
                HtmlAlign.Log.LogicalMeasureAgain.toString() +
                ';\nBehaviorRemeasure: ' +
                HtmlAlign.Log.BehaviorMeasureAgain.toString() +
                ';\nMeasures: ' +
                HtmlAlign.Log.Measures.toString() +
                ';\nRootArrangesNotified: ' +
                HtmlAlign.Log.RootArrangesNotified.toString() +
                ';\nBehaviorArranges: ' +
                HtmlAlign.Log.BehaviorArranges.toString() +
                ';\nArranges: ' +
                HtmlAlign.Log.Arranges.toString());
        }
    };
})(HtmlAlign || (HtmlAlign = {}));
//# sourceMappingURL=HtmlAlign.js.map
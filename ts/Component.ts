
/// <reference path='Dimension.ts'/>

namespace HtmlAlign {

    export interface SizeRangeSetter {
        width?: number;
        height?: number;
        star?: number;
        min?: number;
        max?: number;
    }

    export class Component implements ITwoDimensionalSet<Dimension> {
        // variáveis para auxiliar na identificação do componente
        private _isLogical: boolean;
        private _isRoot: boolean;
        private _isBehavior: boolean;
        private _isContent: boolean;

        public get IsContent() {
            return this._isContent;
        }

        private _behavior: IBehavior;
        private _isBehaviorChanged = false;
        public get Behavior() {
            return this._behavior;
        }
        public set Behavior(value: IBehavior) {
            if (this._behavior != undefined && this._behavior.Name != value.Name) {
                this._isBehaviorChanged = true;
            }

            if (this._behavior == undefined || this._isBehaviorChanged) {
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
        
        public get Visible(): boolean {
            return this.H.Visible;
        }
        public set Visible(value: boolean) {
            this.H.Visible = value;
            this.V.Visible = value;
        }
        
        public get HorizontalScroll() {
            return this.H.Scroll;
        }
        public get VerticalScroll() {
            return this.V.Scroll;
        }
        public set HorizontalScroll(value: Scroll) {
            this.H.Scroll = value; 
        }
        public set VerticalScroll(value: Scroll) {
            this.V.Scroll = value;
        }

        private _frozen = false;
        public Frozen(): void {
            this._frozen = true;
        }
        public Unfrozen(): void {
            this._frozen = false;

            this.NotifyTagChanged();
            HtmlAlign.RefreshLayout();
        }

        public H = new Dimension();
        public V = new Dimension();

        public Get(axis: Axis): Dimension {
            if (axis == Axis.Horizontal) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        public GetAwry(axis: Axis): Dimension {
            if (axis == Axis.Vertical) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        public Set(axis: Axis, value: Dimension): void {
            if (axis == Axis.Horizontal) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
        public SetAwry(axis: Axis, value: Dimension): void {
            if (axis == Axis.Vertical) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }

        constructor(public readonly Father: Component, public readonly Element: HTMLElement) {

            // componente lógico
            if (this.Element == undefined) {
                this.Behavior = new LogicalBehavior();
                this.Behavior.Component = this;
            }
            // componente físico
            else {
                this.Element["component"] = this;

                // informa que o elemento mudará o css quando o mouse estiver sobre ele
                if (this.Element.attributes["hover"] != null) {
                    this.Element.addEventListener("mouseover", () => this.NotifyTagChanged());
                    this.Element.addEventListener("mouseout", () => this.NotifyTagChanged());
                }

                // realiza a primeira leitura das propriedades css
                Layout.RefreshValuesFromCssProperties(this);

                // precisa inicializar, realiza a leitura dos filhos
                if (this.Behavior.Name != "in" && this.Element.hasChildNodes) {
                    var element = <HTMLElement>this.Element.firstElementChild;

                    // itera sobre todos os elementos irmãos
                    while (element != null) {
                        if (Layout.IsBehavior(element)) {
                            this.Children.push(new Component(this, element));
                        }
                        else if (element.attributes["in"] != null) {
                            this.Children.push(new Component(this, element));
                        }

                        element = <HTMLElement>element.nextElementSibling;
                    }
                }
            }
        }
        
        public Children: Component[] = [];
        public FatherAttached: Object = {};

        // atributos que armazenam modificações dos compnentes
        // para futuro processamento
        private _needMeasure = true;
        private _needRefreshCssProperties = false;
        private _characterDataChanged = false;
        private _needArrange: boolean = true;
        private _childNeedArrange: boolean = true;
        private _addedElements: HTMLElement[] = [];
        private _removedElements: HTMLElement[] = [];
        private _changedCssProperties: ICssProperty[] = [];

        public get NeedArrange(): boolean {
            return this._needArrange || this._childNeedArrange;
        }

        // notificações para informar que o componente modificou e precisará de
        // uma nova medida. Essa notificação terá que ir até o componente raiz
        public NotifyNeedMeasure(): void {
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
        public NotifyTagChanged(): void {
            this._needRefreshCssProperties = true;

            this.NotifyNeedMeasure();
        }
        public NotifyAdded(element: HTMLElement): void {
            // se for um conteúdo, apenas notifica que houve uma modificação
            if (this._isContent) {
                this.NotifyTagChanged();

                return;
            }

            // necessário pois o DOM pode não ter se montado corretamente ainda
            setTimeout(() => {
                // o filho adicionado tem que ser um behavior um um conteúdo
                // e esse componente não pode ser um conteúdo
                if (Layout.IsBehavior(element)) {

                    this._addedElements.push(element);

                    Log.AddedElements++;
                }

                // se o componente não está visivel deixa pra depois o processamento dos filhos
                if (this.Visible) {
                    this.NotifyNeedMeasure();
                }
            }, 16);
        }
        public NotifyRemoved(element: HTMLElement): void {
            // se for um conteúdo, apenas notifica que houve uma modificação
            if (this._isContent) {
                this.NotifyTagChanged();

                return;
            }

            // o filho adicionado tem que ser um behavior um um conteúdo
            // e esse componente não pode ser um conteúdo
            if (Layout.IsBehavior(element)) {

                this._removedElements.push(element);

                Log.RemovedElements++;
            }

            // se o componente não está visivel deixa pra depois o processamento dos filhos
            if (this.Visible) {
                this.NotifyNeedMeasure();
            }
        }
        public NotifyCssPropertyChanged(cssProperty: ICssProperty) {
            this.Element.style.setProperty(cssProperty.Name,
                cssProperty.GetValueStringFromComponent(this));
            
            this.NotifyNeedMeasure();
        }

        // notificações para informar que o componente modificou e precisará
        // de um novo arranjo
        public NotifyToRefreshArrange(): void {
            this._needArrange = true;

            this.NotifyArrange();
        }
        public NotifyArrange(): void {
            if (!this._childNeedArrange) {
                this._childNeedArrange = true;
                this.Father.NotifyArrange();
            }
            else {
                this._childNeedArrange = true;
            }
        }

        public SetCssPropertyValue(cssProperty: ICssProperty) {
            this.Element.style.setProperty(cssProperty.Name,
                cssProperty.GetValueStringFromComponent(this));
        }

        // Valores do atributo size
        public get Width(): SizeRangeSetter | number {
            return {
                width: this.H.Size.Min,
                star: this.H.Size.Star,
                min: this.H.Size.Min,
                max: this.H.Size.Max
            };
        }
        public set Width(value: SizeRangeSetter | number) {
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

                this.NotifyCssPropertyChanged(PanelBehavior.SizeCssProperty);
            }
        }
        public get Height(): SizeRangeSetter | number {
            return {
                height: this.V.Size.Min,
                star: this.V.Size.Star,
                min: this.V.Size.Min,
                max: this.V.Size.Max
            };
        }
        public set Height(value: SizeRangeSetter | number) {
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

                this.NotifyCssPropertyChanged(PanelBehavior.SizeCssProperty);
            }
        }

        public _canInformNeedArrangeInMeasure = true;
        public Measure(h: SizeDelimiter, v: SizeDelimiter) {
            // componentes congelados não sofrem alterações
            if (this._frozen) {
                return;
            }

            // processa a atualização das propriedades css do componente
            if (this._needRefreshCssProperties) {
                this._needRefreshCssProperties = false;

                Layout.RefreshValuesFromCssProperties(this);

                // se o behavior modificou durante a leitura será necessário
                // ler novamente as propriedades e notificar os filhos para fazer o mesmo
                if (this._isBehaviorChanged) {
                    this._isBehaviorChanged = false;

                    Layout.RefreshValuesFromCssProperties(this);

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
            if (this._isBehavior) {
                // processa a remoção de elementos
                var removedElementsLength = this._removedElements.length;
                if (removedElementsLength > 0) {

                    // varre a lista de elementos removidos
                    for (var index = 0; index < removedElementsLength; index++) {
                        var element = this._removedElements[index];

                        var component = <Component>element["component"];
                        if (component != undefined) {

                            var index: number = this.Children.indexOf(component);
                            if (index > -1) {
                                this.Children.splice(index, 1);
                            }

                            element["component"] = undefined;
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
                            if (Layout.IsBehavior(element)) {
                                this.Children.push(new Component(this, element));
                            }

                            // atualiza o último elemento para a próxima iteração
                            lastElement = element;
                        }
                        // o elemento foi adicionado na primeira posição
                        else if (firstElement.previousElementSibling == element) {
                            if (Layout.IsBehavior(element)) {
                                this.Children.splice(0, 0, new Component(this, element));
                            }

                            firstElement = element;
                        }
                        // caso contrário a adição é mais complexa, tem que procurar a exata posição
                        // na lista de filhos em que o novo componente deverá ser adicionado
                        else {
                            // não há mais como garantir o auxílio
                            lastElement = this.Element;
                            firstElement = this.Element;

                            var elementSibling = this.Element.firstElementChild;

                            if (elementSibling.previousElementSibling == element) {
                                if (Layout.IsBehavior(element)) {
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
                                        if (Layout.IsBehavior(element)) {
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

            this._needMeasure = false;

            // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
            // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
            // ao componente pai ele precisará ser rearranjado
            if (this._canInformNeedArrangeInMeasure && (this.H.NeedArrange || this.V.NeedArrange)) {
                this._needArrange = true;
                this.Father.NotifyToRefreshArrange();
            }

            Log.Measures++;
        }

        public Arrange(): void {
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

                    this.Measure(new SizeDelimiter(this.H.GivedSpace.Size, this.H.GivedSpace.Size),
                        new SizeDelimiter(this.V.GivedSpace.Size, this.V.GivedSpace.Size));

                    this._canInformNeedArrangeInMeasure = true;
                    Log.BehaviorMeasureAgain++;
                }

                this._behavior.Arrange();

                Log.BehaviorArranges++;
            }
            else if (this._childNeedArrange) {
                for (var index = 0; index < this.Children.length; index++) {
                    var child = this.Children[index];
                    if (child.NeedArrange) {
                        this.Children[index].Arrange();
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

            Log.Arranges++;
        }
    }
}
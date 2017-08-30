
/// <reference path='Dimension.ts'/>

namespace HtmlAlign {

    export class Component implements ITwoDimensionalSet<Dimension> {
        // variáveis para auxiliar na identificação do componente
        public _isLogical: boolean;
        public _isRoot: boolean;
        public _isBehavior: boolean;
        public _isContent: boolean;
        public _oi123: number;

        constructor(public readonly Father: Component, public readonly Element: HTMLElement) {

            // componente lógico
            if (!this.Element) {
                this.Behavior = new LogicalBehavior();
                this.Behavior.Component = this;
            }
            // componente físico
            else {
                this.Element["component"] = this;

                // realiza a primeira leitura das propriedades css
                Layout.RefreshValuesFromCssProperties(this);

                // precisa inicializar, realiza a leitura dos filhos
                if (this.Behavior.Name != "in") {
                    //this.NotifyNeedCreateCssRule();
                    var element = <HTMLElement>this.Element.firstElementChild;

                    // itera sobre todos os elementos irmãos
                    while (element) {
                        if (Layout.IsBehavior(element)
                            || element.attributes["in"] != null) {
                            this.Children.push(new Component(this, element));
                        }

                        element = <HTMLElement>element.nextElementSibling;
                    }
                }
            }
        }
        
        public Children: Component[] = [];
        public H = new Dimension();
        public V = new Dimension();
        public FatherAttached: Object = {};

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

        private _behavior: IBehavior;
        private _isBehaviorChanged = false;
        public get Behavior() {
            return this._behavior;
        }
        public set Behavior(value: IBehavior) {
            // [TODO] temporário, precisa melhorar
            if (!value) {
                if (!this._behavior) {
                    value = new PanelBehavior();
                }
                else {
                    return;
                }
            }

            if (this._behavior && this._behavior.Name != value.Name) {
                // [TODO] [FIT] temporário, precisa melhorar
                if (this._behavior.Name == "fit") {
                    this.Element.style.removeProperty("transform");
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

            this.NotifyCssPropertiesChanged();
            HtmlAlign.RefreshLayout();
        }

        public NotifyCssPropertyChanged(cssProperty: ICssProperty) {
            this.Element.style.setProperty(cssProperty.Name,
                cssProperty.GetValueStringFromComponent(this));

            this.NotifyNeedMeasure();
        }

        public SetCssPropertyValue(cssProperty: ICssProperty) {
            this.Element.style.setProperty(cssProperty.Name,
                cssProperty.GetValueStringFromComponent(this));
        }

        private _childrenChanged = false;
        private _cssPropertiesChanged = false;
        private _needArrange = false;
        private _childNeedArrange = false;
        private _needMeasure = true;
        private _needLayout = false;
        private _childNeedLayout = false;

        public NotifyChildrenChanged() {
            if (this._isBehavior || this._isRoot) {
                this._childrenChanged = true;

                this.NotifyNeedMeasure();
            }
            else {
                this.NotifyCssPropertiesChanged();
            }
        }
        public NotifyCssPropertiesChanged() {
            this._cssPropertiesChanged = true;

            this.NotifyNeedMeasure();
        }
        public NotifyNeedMeasure() {
            if (!this._needMeasure) {
                this._needMeasure = true;

                this.Father.NotifyNeedMeasure();
            }
        }
        public NotifyNeedArrange() {
            this._needArrange = true;

            this.Father.NotifyChildNeedArrange();
        }
        public NotifyChildNeedArrange() {
            if (!this._childNeedArrange) {
                this._childNeedArrange = true;

                this.Father.NotifyChildNeedArrange();
            }
        }
        public NotifyNeedLayout() {
            this._needLayout = true;

            this.Father.NotifyChildNeedLayout();
        }
        public NotifyChildNeedLayout() {
            if (!this._childNeedLayout) {
                this._childNeedLayout = true;

                this.Father.NotifyChildNeedLayout();
            }
        }

        public ProcessChangeChildren() {
            if (this._isBehavior || this._isRoot) {
                var element = <HTMLElement>this.Element.firstElementChild;
                if (!element && this.Children.length > 0) {
                    this.Children = [];
                }
                else if (element && this.Children.length == 0) {
                    // itera sobre todos os elementos irmãos
                    while (element) {
                        if (Layout.IsBehavior(element)
                            || element.attributes["in"] != null) {
                            this.Children.push(new Component(this, element));
                        }

                        element = <HTMLElement>element.nextElementSibling;
                    }
                }
                else {
                    var childPosition = 0;
                    var child = this.Children[childPosition];

                    // itera sobre todos os elementos irmãos
                    while (element) {
                        if (Layout.IsBehavior(element)
                            || element.attributes["in"] != null) {

                            if (childPosition == this.Children.length) {
                                this.Children.push(new Component(this, element));
                                childPosition++;
                            }
                            else {
                                var comp = <Component>element["component"];
                                if (comp) {
                                    while (comp != child && childPosition < this.Children.length) {
                                        // [TODO] [FIT] temporário, precisa melhorar
                                        if (comp._behavior.Name == "fit") {
                                            this.Element.style.removeProperty("transform");
                                        }

                                        this.Children.splice(childPosition, 1);
                                        child = this.Children[childPosition];
                                    }

                                    if (childPosition < this.Children.length) {
                                        childPosition++;
                                        child = this.Children[childPosition];
                                    }
                                }
                                else {
                                    this.Children.splice(childPosition, 0, new Component(this, element));
                                    childPosition++;
                                }
                            }
                        }

                        element = <HTMLElement>element.nextElementSibling;
                    }
                }
                
                this.NotifyNeedArrange();
                this.Father.NotifyNeedArrange();
            }

            this._childrenChanged = false;
        }

        public ProcessCssPropertiesChanged() {
            Layout.RefreshValuesFromCssProperties(this);

            //this.NotifyNeedMeasure();
            this.NotifyNeedArrange();
            this.Father.NotifyNeedArrange();

            // se o behavior modificou durante a leitura será necessário
            // ler novamente as propriedades e notificar os filhos para fazer o mesmo
            if (this._isBehaviorChanged) {
                this._isBehaviorChanged = false;

                Layout.RefreshValuesFromCssProperties(this);
                for (var index = 0; index < this.Children.length; index++) {
                    this.Children[index].NotifyCssPropertiesChanged();
                }
            }

            this._cssPropertiesChanged = false;
        }

        public Measure(h: SizeDelimiter, v: SizeDelimiter) {
            // componentes congelados não sofrem alterações
            if (this._frozen || !this.Visible) {
                return;
            }

            if (this._childrenChanged) {
                this.ProcessChangeChildren();
            }

            if (this._cssPropertiesChanged) {
                this.ProcessCssPropertiesChanged();
            }

            this.H.GivedDelimiter = h;
            this.V.GivedDelimiter = v;

            // se o elemento não precisa ser medido não precisa fazer nada
            if (!this._needMeasure && !this.H.IsComponentDelimiterChanged
                && !this.V.IsComponentDelimiterChanged) {
                return;
            }

            this._behavior.Measure();

            // se o tamanho desejado pelo componente foi modificado ele precisará arranjar novamente os filhos
            // se a delimitação de tamanho foi modificada pelo componente pai e esse componte tem tamanho relativo
            // ao componente pai ele precisará ser rearranjado
            if (this._canInformNeedArrangeInMeasure && (this.H.NeedArrange || this.V.NeedArrange)) {
                this.NotifyNeedArrange();
                this.Father.NotifyNeedArrange();
            }

            this._needMeasure = false;
            Log.Measures++;
        }

        public _canInformNeedArrangeInMeasure = true;
        private _hSizeDelimiter = new SizeDelimiter(0, 0);
        private _vSizeDelimiter = new SizeDelimiter(0, 0);
        public Arrange() {
            // componentes congelados não sofrem alterações
            if (this._frozen) {
                return;
            }
            
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

                    this._hSizeDelimiter.Min = this._hSizeDelimiter.Max = this.H.GivedSpace.Size;
                    this._vSizeDelimiter.Min = this._vSizeDelimiter.Max = this.V.GivedSpace.Size;

                    this.H.GivedDelimiter = this._hSizeDelimiter;
                    this.V.GivedDelimiter = this._vSizeDelimiter;

                    // verifica se precisa de uma nova medida
                    if (this.H.IsComponentDelimiterChanged || this.V.IsComponentDelimiterChanged) {
                        this._behavior.Measure();
                    }

                    this._canInformNeedArrangeInMeasure = true;
                    Log.BehaviorMeasureAgain++;
                }

                this._behavior.Arrange();

                Log.BehaviorArranges++;
            }
            else if (this._childNeedArrange) {
                // [TODO] [FIT] temporário, precisa melhorar
                if (this._behavior.Name == "fit") {
                    this._behavior.Arrange();
                }
                else {
                    for (var index = 0; index < this.Children.length; index++) {
                        this.Children[index].Arrange();
                    }
                }
            }

            this._needArrange = false;
            this._childNeedArrange = false;

            if (!this._behavior.IsLayoutOverridedInArrange && (this.H.NeedLayout || this.V.NeedLayout)) {
                this._needLayout = true;
                this.Father.NotifyChildNeedLayout();
            }
        }

        public ProcessLayout() {
            if (this._needLayout) {

                this.H.RefreshLayout(this, Axis.Horizontal);
                this.V.RefreshLayout(this, Axis.Vertical);

                this.Element["laststyle"] = this.Element.getAttribute("style");

                this._needLayout = false;
            }

            if (this._childNeedLayout) {
                for (var i = 0; i < this.Children.length; i++) {
                    this.Children[i].ProcessLayout();
                }
                this._childNeedLayout = false;
            }
        }
    }
}
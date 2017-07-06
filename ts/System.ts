
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

namespace HtmlAlign {

    class CssPropertyEntry {
        constructor(public BehaviorName: string, public CssProperty: ICssProperty) { }
    }

    class System {
        private _behaviors: IBehavior[] = [];
        private _cssPropertyEntry: CssPropertyEntry[] = [];
        private _root: Component;
        private _baseStyleElement: HTMLStyleElement;

        public _notifyChildrenChangedList: Component[] = [];
        public _notifyCssPropertyChangedList: Component[] = [];
        public _cancelNextRefreshByMeasure = false;

        public MaxContentString = "max-content";

        constructor() {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                this.MaxContentString = "-moz-max-content";
            }

            // inicializa os comportamentos padrões
            this.RegisterBehavior(new PanelBehavior());
            this.RegisterBehavior(new InBehavior());
            this.RegisterBehavior(new StackBehavior());
            this.RegisterBehavior(new WrapBehavior());
            this.RegisterBehavior(new DockBehavior());
            this.RegisterBehavior(new GridBehavior());
            this.RegisterBehavior(new FitBehavior());

            this.RefreshBaseStyle();
        }

        private _processoChanges() {
            this._cancelNextRefreshByMeasure = true;

            var _qtdChildrenChanged = this._notifyChildrenChangedList.length;
            var _qtdCssPropertiesChanged = this._notifyCssPropertyChangedList.length;

            for (var i = 0; i < _qtdChildrenChanged; i++) {
                this._notifyChildrenChangedList[i].NotifyChildrenChanged();
            }

            for (var i = 0; i < _qtdCssPropertiesChanged; i++) {
                this._notifyCssPropertyChangedList[i].NotifyCssPropertiesChanged();
            }

            this._notifyChildrenChangedList.splice(0, _qtdChildrenChanged);
            this._notifyCssPropertyChangedList.splice(0, _qtdCssPropertiesChanged);

            this._cancelNextRefreshByMeasure = false;
        }

        public RefreshBaseStyle(): void {
            var cssList: string[] = [];
            var behaviorNameList: string[] = [];
            var panelDefaultValuesList: string[] = [];

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
                var behaviorComponentCssList: string[] = [];
                var behaviorChildCssList: string[] = [];

                behaviorComponentCssList.push("--behavior:" + behavior.Name);

                for (var indexCssProperty = 0; indexCssProperty < behaviorCssProperties.length; indexCssProperty++) {
                    var behaviorCssProperty = behaviorCssProperties[indexCssProperty];
                    var defaultValue = behaviorCssProperty.DefaultValue();
                    if (defaultValue != null) {
                        if (behaviorCssProperty.Context == CssPropertyContext.Component) {
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

        public Init(): void {
            var hSize = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var vSize = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            // inicializa o componente raiz
            // adiciona um componente pai ao componente raiz
            // esse componente será o finalizador da propagação de notificação de atualização
            var rootFather = <Component>{ Behavior: {} };
            rootFather.NotifyNeedMeasure = function () {
                Log.RootMeasuresNotified++;

                if (this._cancelNextRefreshByMeasure) {
                    this._cancelNextRefreshByMeasure = false;
                }
                else {
                    setTimeout(HtmlAlign.RefreshLayout, 4);
                }
            };
            rootFather.NotifyNeedArrange =
            rootFather.NotifyChildNeedArrange = function () { Log.RootArrangesNotified++; };
            rootFather.NotifyChildNeedLayout = function () { };

            this._root = new Component(rootFather, document.body);
            this._root.ProcessCssPropertiesChanged = function () { };
            document.body["component"] = this._root;

            this._root.H.Size.Min = hSize;
            this._root.V.Size.Min = vSize;
            
            this.ExecuteRefreshLayout();
        }

        public ExecuteRefreshLayout(): void {
            this._processoChanges();

            this._root.Measure(SizeDelimiter.Default(), SizeDelimiter.Default());

            this._root.H.GivedSpace = new Space(0, this._root.H.ComponentRequired);
            this._root.V.GivedSpace = new Space(0, this._root.V.ComponentRequired);

            this._root.Arrange();

            this._root.ProcessLayout();
        }

        public RefreshValuesFromCssProperties(component: Component) {
            var css = window.getComputedStyle(component.Element);

            for (var index: number = 0; index < this._cssPropertyEntry.length; index++) {
                var entry: CssPropertyEntry = this._cssPropertyEntry[index];

                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.BehaviorName == "panel"
                    // busca os atributos do behavior corrente
                    || (entry.CssProperty.Context == CssPropertyContext.Component
                        && component.Behavior.Name == entry.BehaviorName)
                    // busca os atributos adicionados aos filhos do comportamento
                    || (entry.CssProperty.Context == CssPropertyContext.Child
                        && component.Father.Behavior.Name == entry.BehaviorName)) {

                    entry.CssProperty
                        .SetValueFromCssProperty(css.getPropertyValue(entry.CssProperty.Name), component);
                }
            }

            Log.ReadedCssProperties++;
        }

        public RefreshRootSize(): void {
            this._root.H.Size.Min = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            this._root.V.Size.Min = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            this._root.NotifyNeedMeasure();
            HtmlAlign.RefreshLayout();
        }

        public RegisterBehavior(behavior: IBehavior): void {
            this._behaviors.push(behavior);

            var behaviorCssProperties: ICssProperty[] = behavior.GetCssProperties();
            if (behaviorCssProperties != null) {
                for (var index: number = 0; index < behaviorCssProperties.length; index++) {
                    this._cssPropertyEntry.push(new CssPropertyEntry(behavior.Name, behaviorCssProperties[index]));
                }
            }
        }

        public IsBehavior(element: HTMLElement): boolean {
            if (element.tagName == undefined) {
                return false;
            }

            var name = element.tagName.toLowerCase();

            for (var index: number = 0; index < this._behaviors.length; index++) {
                if (this._behaviors[index].Name == name) {
                    return true;
                }
            }

            if (element.attributes["in"] != null) {
                return true;
            }

            return false;
        }
        public GetBehavior(component: Component, behaviorName: string): IBehavior {
            if (component.Element.tagName == "BODY") {
                return new BodyBehavior();
            }

            for (var index: number = 0; index < this._behaviors.length; index++) {
                var behavior: IBehavior = this._behaviors[index];
                if (behavior.Name == behaviorName) {
                    return behavior.GetNew();
                }
            }

            return null;
        }
        public GetBehaviorName(component: Component): string {
            if (component.Behavior != undefined) {
                return component.Behavior.Name;
            }
        }

        public _verifyStyleSheetChanged(refreshValuesFirst: boolean) {
            if (refreshValuesFirst) {
                this._verifyStyleSheetChangedComponent(this._root, true);
            }

            this._verifyStyleSheetChangedComponent(this._root, false);
        }

        private _verifyStyleSheetChangedComponent(component: Component, refreshValuesFirst: boolean) {
            var computed = window.getComputedStyle(component.Element);
            var cssText = "";

            for (var index: number = 0; index < this._cssPropertyEntry.length; index++) {
                var entry: CssPropertyEntry = this._cssPropertyEntry[index];

                // as propriedades do panel são comuns a todos os comportamentos
                if (entry.BehaviorName == "panel"
                    // busca os atributos do behavior corrente
                    || (entry.CssProperty.Context == CssPropertyContext.Component
                        && component.Behavior.Name == entry.BehaviorName)
                    // busca os atributos adicionados aos filhos do comportamento
                    || (entry.CssProperty.Context == CssPropertyContext.Child
                        && component.Father.Behavior.Name == entry.BehaviorName)) {

                    cssText += computed.getPropertyValue(entry.CssProperty.Name);
                }
            }

            if (component.FatherAttached["lastCssText"] == undefined || refreshValuesFirst) {
                component.FatherAttached["lastCssText"] = cssText;
            }
            else if (component.FatherAttached["lastCssText"] != cssText) {
                component.FatherAttached["lastCssText"] = cssText;
                component.NotifyCssPropertiesChanged();
            }

            for (var index = 0; index < component.Children.length; index++) {
                this._verifyStyleSheetChangedComponent(component.Children[index], refreshValuesFirst);
            }
        }
        
        private ForceRereadAllCssProperties(component: Component): void {
            component.NotifyCssPropertiesChanged();

            for (var index = 0; index < component.Children.length; index++) {
                this.ForceRereadAllCssProperties(component.Children[index]);
            }
        }
    }

    export const Layout = new System();

    var _waitingToRefresh = false;
    var _inRefreshingProcess = false;
    var _hasRefreshGuarantee = false;
    export function RefreshLayout(): void {
        if (!_waitingToRefresh && !_hasRefreshGuarantee) {
            _waitingToRefresh = true;
            
            _refreshProtection();
        }
        else if (_inRefreshingProcess && !_hasRefreshGuarantee) {
            _hasRefreshGuarantee = true;

            requestAnimationFrame(_refreshGuarantee);
        }
    };
    
    function _refreshGuarantee(): void {
        _hasRefreshGuarantee = false;
        RefreshLayout();
    };

    function _refreshProtection(): void {
        if (!_inRefreshingProcess) {
            _inRefreshingProcess = true;
            
            _refresh();
        }
    }

    function _refresh(): void {
        try {
            Layout.ExecuteRefreshLayout();

            Log.LayoutRefreshed++;
        }
        catch (ex) {
            console.log("Erro em _refreshArrange");
            console.log(ex);
        }
        finally {
            _inRefreshingProcess = false;
            _waitingToRefresh = false;
        }
    };

    var _isVerifyingStyleSheet = true;
    function _verifyStyleSheetWorker(): void {
        var isDevToolsOpen = IsDevToolsOpen();
        if (Config.VerifyStyleSheetPeriodicaly
            || (isDevToolsOpen && Config.IfDevToolsOpenRefresh)) {

            Layout._verifyStyleSheetChanged(!_isVerifyingStyleSheet);

            _isVerifyingStyleSheet = true;
        }
        else {
            _isVerifyingStyleSheet = false;
        }

        if (Config.VerifyStyleSheetPeriodicaly) {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker,
                Config.VerifyStyleSheetPeriodicalyDelay));
        }
        else if (isDevToolsOpen) {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker,
                Config.DevToolsOpenRefreshDelay));
        }
        else {
            // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
            requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, 2000));
        }
    };
    
    var _lastStateDevTools = false;
    function IsDevToolsOpen(): boolean {
        var threshold = Config.DevToolsTreshhold;
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
    };

    function Debouncer(func, timeout) {
        var timeoutID, timeout = timeout || 200;
        return function () {
            var scope = this, args = arguments;
            clearTimeout(timeoutID);
            timeoutID = setTimeout(function () {
                func.apply(scope, Array.prototype.slice.call(args));
            }, timeout);
        }
    };

    var observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
        var qtdList = mutations.length;
        for (var indexRecord = 0; indexRecord < qtdList; indexRecord++) {
            var mutationRecord: MutationRecord = mutations[indexRecord];
            // se foi uma atualização de texto ou de uma tag que não implementa nenhum comportamento
            // é feita uma pesquisa subindo na árvore DOM por qual é o primeiro componente pai em que
            // essa atualização está contida, se esse componente é um conteúdo é disparada uma rotina
            // de medida para verificar se o conteúdo necessita de um novo espaço para si
            if (mutationRecord.type == "characterData" || mutationRecord.target["component"] == undefined) {
                var element = <HTMLElement>mutationRecord.target;
                while (element != undefined) {
                    if (element["component"] != null) {
                        var component: Component = element["component"];

                        if (component.Behavior.Name == "in") {
                            Layout._notifyCssPropertyChangedList.push(component);
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
                var component: Component = mutationRecord.target["component"];

                if (mutationRecord.attributeName != undefined) {
                    var element = <HTMLElement>mutationRecord.target;

                    // se o componente estiver congelado ou a atualização ocorreu no atributo style mas refere-se
                    // apenas a atualização de posição conhecida não deve ser disparado uma medida
                    if (mutationRecord.attributeName == "style" && element["laststyle"] == element.getAttribute("style")) {
                        continue;
                    }

                    Layout._notifyCssPropertyChangedList.push(component);
                }

                for (var index = 0; index < mutationRecord.removedNodes.length; index++) {
                    Layout._notifyChildrenChangedList.push(component);
                }

                // possível melhora, os elementos aparecem duplicados na lista
                for (var index = 0; index < mutationRecord.addedNodes.length; index++) {
                    Layout._notifyChildrenChangedList.push(component);
                }
            }
        }

        if (Layout._notifyChildrenChangedList.length > 0
            || Layout._notifyCssPropertyChangedList.length > 0) {
            requestAnimationFrame(HtmlAlign.RefreshLayout);
        }
    });

    function _init() {
        // realiza a primeira rotina de medição e arranjo
        Layout.Init();

        // inicia o observador de mudanças nos elementos
        observer.observe(document.body, { attributes: true, childList: true, subtree: true, characterData: true });

        // inicializa o verificador de update
        requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, 2000));

        window.addEventListener('resize', function () { Layout.RefreshRootSize(); });
    };

    if (document.readyState === "complete") {
        _init();
    }
    else {
        window.addEventListener("load", function () { _init(); });
    }

    // configurações
    export const Config = {
        DevToolsTreshhold: 160,
        IfDevToolsOpenRefresh: true,
        DevToolsOpenRefreshDelay: 400,
        VerifyStyleSheetPeriodicaly: false,
        VerifyStyleSheetPeriodicalyDelay: 1000
    };

    // logs
    export const Log = {
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
            console.log(
                "LayoutRefreshed: " + Log.LayoutRefreshed.toString()
                + ";\nReadedCssProperties: " + Log.ReadedCssProperties.toString()
                + ";\nAddedElements: " + Log.AddedElements.toString()
                + ";\nRemovedElements: " + Log.RemovedElements.toString()
                + ";\nRootMeasuresNotified: " + Log.RootMeasuresNotified.toString()
                + ";\nRootScrollRemeasure: " + Log.RootScrollMeasureAgain.toString()
                + ";\nLogicalRemeasure: " + Log.LogicalMeasureAgain.toString()
                + ";\nBehaviorRemeasure: " + Log.BehaviorMeasureAgain.toString()
                + ";\nMeasures: " + Log.Measures.toString()
                + ";\nRootArrangesNotified: " + Log.RootArrangesNotified.toString()
                + ";\nBehaviorArranges: " + Log.BehaviorArranges.toString()
                + ";\nArranges: " + Log.Arranges.toString());
        }
    };
}
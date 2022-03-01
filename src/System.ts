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
namespace HtmlAlign {
  class CssPropertyEntry {
    constructor(
      public behaviorName: string,
      public cssProperty: ICssProperty
    ) {}
  }

  class System {
    #behaviors: IBehavior[] = [];
    #cssPropertyEntry: CssPropertyEntry[] = [];
    #root: Component;
    #baseStyleElement: HTMLStyleElement;

    public _notifyChildrenChangedList: Component[] = [];
    public _notifyCssPropertyChangedList: Component[] = [];
    public _cancelNextRefreshByMeasure = false;

    public maxContentString = 'max-content';

    constructor() {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        this.maxContentString = '-moz-max-content';
      }

      // inicializa os comportamentos padrões
      this.registerBehavior(new PanelBehavior());
      this.registerBehavior(new InBehavior());
      this.registerBehavior(new StackBehavior());
      this.registerBehavior(new WrapBehavior());
      this.registerBehavior(new DockBehavior());
      this.registerBehavior(new GridBehavior());
      this.registerBehavior(new FitBehavior());

      this.refreshBaseStyle();
    }

    #processoChanges() {
      this._cancelNextRefreshByMeasure = true;

      const _qtdChildrenChanged = this._notifyChildrenChangedList.length;
      const _qtdCssPropertiesChanged =
        this._notifyCssPropertyChangedList.length;

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

    public refreshBaseStyle(): void {
      const cssList: string[] = [];
      const behaviorNameList: string[] = [];
      const panelDefaultValuesList: string[] = [];

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
          panelDefaultValuesList.push(
            panelCssProperty.name + ':' + defaultValue
          );
        }
      }

      cssList.push(
        behaviorNameList.join(',') +
          '{' +
          panelDefaultValuesList.join(';') +
          '}'
      );

      for (let index = 2; index < this.#behaviors.length; index++) {
        const behavior = this.#behaviors[index];
        const behaviorCssProperties = behavior.getCssProperties();
        const behaviorComponentCssList: string[] = [];
        const behaviorChildCssList: string[] = [];

        behaviorComponentCssList.push('--behavior:' + behavior.name);

        for (
          let indexCssProperty = 0;
          indexCssProperty < behaviorCssProperties.length;
          indexCssProperty++
        ) {
          const behaviorCssProperty = behaviorCssProperties[indexCssProperty];
          const defaultValue = behaviorCssProperty.defaultValue();
          if (defaultValue != null) {
            if (behaviorCssProperty.context == CssPropertyContext.component) {
              behaviorComponentCssList.push(
                behaviorCssProperty.name + ':' + defaultValue
              );
            } else {
              behaviorChildCssList.push(
                behaviorCssProperty.name + ':' + defaultValue
              );
            }
          }
        }

        cssList.push(
          behavior.name + '{' + behaviorComponentCssList.join(';') + '}'
        );
        if (behaviorChildCssList.length > 0) {
          cssList.push(
            behavior.name + '>*{' + behaviorChildCssList.join(';') + '}'
          );
        }
      }

      cssList.push('body{overflow:auto;margin:0}');
      cssList.push(
        'in,*[in]{--behavior:in;width:' +
          this.maxContentString +
          ';height:' +
          this.maxContentString +
          ';}'
      );

      if (this.#baseStyleElement) {
        document.head.removeChild(this.#baseStyleElement);
      }

      this.#baseStyleElement = document.createElement('style');
      this.#baseStyleElement.appendChild(
        document.createTextNode(cssList.join('\n'))
      );

      if (document.head.firstChild) {
        document.head.insertBefore(
          this.#baseStyleElement,
          document.head.firstChild
        );
      } else {
        document.head.appendChild(this.#baseStyleElement);
      }

      if (this.#root) {
        this.forceRereadAllCssProperties(this.#root);
      }
    }

    public init(): void {
      const horizontalSize = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const verticalSize = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      // inicializa o componente raiz
      // adiciona um componente pai ao componente raiz
      // esse componente será o finalizador da propagação de notificação de atualização
      const rootParent = <Component>{ behavior: {} };
      rootParent.notifyNeedMeasure = function () {
        Log.RootMeasuresNotified++;

        if (this._cancelNextRefreshByMeasure) {
          this._cancelNextRefreshByMeasure = false;
        } else {
          setTimeout(refreshLayout, 4);
        }
      };
      rootParent.notifyNeedArrange = rootParent.notifyChildNeedArrange =
        function () {
          Log.RootArrangesNotified++;
        };
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      rootParent.notifyChildNeedLayout = function () {};

      this.#root = new Component(rootParent, <HTMLElementLayout>document.body);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.#root.processCssPropertiesChanged = function () {};
      document.body['component'] = this.#root;

      this.#root.horizontal.size.min = horizontalSize;
      this.#root.vertical.size.min = verticalSize;

      this.executeRefreshLayout();
    }

    public executeRefreshLayout(): void {
      this.#processoChanges();

      this.#root.measure(SizeDelimiter.default(), SizeDelimiter.default());

      this.#root.horizontal.givedSpace = new Space(
        0,
        this.#root.horizontal.componentRequired
      );
      this.#root.vertical.givedSpace = new Space(
        0,
        this.#root.vertical.componentRequired
      );

      this.#root.arrange();

      this.#root.processLayout();
    }

    public refreshValuesFromCssProperties(component: Component) {
      const css = window.getComputedStyle(component.element);

      for (let index = 0; index < this.#cssPropertyEntry.length; index++) {
        const entry: CssPropertyEntry = this.#cssPropertyEntry[index];

        // as propriedades do panel são comuns a todos os comportamentos
        if (
          entry.behaviorName == 'panel' ||
          // busca os atributos do behavior corrente
          (entry.cssProperty.context === CssPropertyContext.component &&
            component.behavior.name === entry.behaviorName) ||
          // busca os atributos adicionados aos filhos do comportamento
          (entry.cssProperty.context === CssPropertyContext.child &&
            component.parent.behavior.name === entry.behaviorName)
        ) {
          entry.cssProperty.setValueFromCssProperty(
            css.getPropertyValue(entry.cssProperty.name),
            component
          );
        }
      }

      Log.ReadedCssProperties++;
    }

    public refreshRootSize(): void {
      this.#root.horizontal.size.min = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      this.#root.vertical.size.min = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      this.#root.notifyNeedMeasure();
      refreshLayout();
    }

    public registerBehavior(behavior: IBehavior): void {
      this.#behaviors.push(behavior);

      const behaviorCssProperties: ICssProperty[] = behavior.getCssProperties();
      if (behaviorCssProperties != null) {
        for (let index = 0; index < behaviorCssProperties.length; index++) {
          this.#cssPropertyEntry.push(
            new CssPropertyEntry(behavior.name, behaviorCssProperties[index])
          );
        }
      }
    }

    public isBehavior(element: HTMLElement): boolean {
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
    public getBehavior(component: Component, behaviorName: string): IBehavior {
      if (component.element.tagName === 'BODY') {
        return new BodyBehavior();
      }

      for (let index = 0; index < this.#behaviors.length; index++) {
        const behavior: IBehavior = this.#behaviors[index];
        if (behavior.name == behaviorName) {
          return behavior.getNew();
        }
      }

      return null;
    }
    public getBehaviorName(component: Component): string {
      if (component.behavior != undefined) {
        return component.behavior.name;
      }
    }

    public _verifyStyleSheetChanged(refreshValuesFirst: boolean) {
      if (refreshValuesFirst) {
        this._verifyStyleSheetChangedComponent(this.#root, true);
      }

      this._verifyStyleSheetChangedComponent(this.#root, false);
    }

    private _verifyStyleSheetChangedComponent(
      component: Component,
      refreshValuesFirst: boolean
    ) {
      const computed = window.getComputedStyle(component.element);
      let cssText = '';

      for (let index = 0; index < this.#cssPropertyEntry.length; index++) {
        const entry: CssPropertyEntry = this.#cssPropertyEntry[index];

        // as propriedades do panel são comuns a todos os comportamentos
        if (
          entry.behaviorName === 'panel' ||
          // busca os atributos do behavior corrente
          (entry.cssProperty.context == CssPropertyContext.component &&
            component.behavior.name == entry.behaviorName) ||
          // busca os atributos adicionados aos filhos do comportamento
          (entry.cssProperty.context == CssPropertyContext.child &&
            component.parent.behavior.name == entry.behaviorName)
        ) {
          cssText += computed.getPropertyValue(entry.cssProperty.name);
        }
      }

      if (
        component.parentAttached['lastCssText'] == undefined ||
        refreshValuesFirst
      ) {
        component.parentAttached['lastCssText'] = cssText;
      } else if (component.parentAttached['lastCssText'] != cssText) {
        component.parentAttached['lastCssText'] = cssText;
        component.notifyCssPropertiesChanged();
      }

      for (let index = 0; index < component.children.length; index++) {
        this._verifyStyleSheetChangedComponent(
          component.children[index],
          refreshValuesFirst
        );
      }
    }

    private forceRereadAllCssProperties(component: Component): void {
      component.notifyCssPropertiesChanged();

      for (let index = 0; index < component.children.length; index++) {
        this.forceRereadAllCssProperties(component.children[index]);
      }
    }
  }

  export const Layout = new System();

  let _waitingToRefresh = false;
  let _inRefreshingProcess = false;
  let _hasRefreshGuarantee = false;
  export function refreshLayout(): void {
    if (!_waitingToRefresh && !_hasRefreshGuarantee) {
      _waitingToRefresh = true;

      _refreshProtection();
    } else if (_inRefreshingProcess && !_hasRefreshGuarantee) {
      _hasRefreshGuarantee = true;

      requestAnimationFrame(_refreshGuarantee);
    }
  }

  // eslint-disable-next-line no-inner-declarations
  function _refreshGuarantee(): void {
    _hasRefreshGuarantee = false;
    refreshLayout();
  }

  // eslint-disable-next-line no-inner-declarations
  function _refreshProtection(): void {
    if (!_inRefreshingProcess) {
      _inRefreshingProcess = true;

      _refresh();
    }
  }

  // eslint-disable-next-line no-inner-declarations
  function _refresh(): void {
    try {
      Layout.executeRefreshLayout();

      Log.LayoutRefreshed++;
    } catch (ex) {
      console.log('Erro em _refreshArrange');
      console.log(ex);
    } finally {
      _inRefreshingProcess = false;
      _waitingToRefresh = false;
    }
  }

  let _isVerifyingStyleSheet = true;
  // eslint-disable-next-line no-inner-declarations
  function _verifyStyleSheetWorker(): void {
    const _isDevToolsOpen = isDevToolsOpen();
    if (
      HtmlAlign.Config.VerifyStyleSheetPeriodicaly ||
      (_isDevToolsOpen && HtmlAlign.Config.IfDevToolsOpenRefresh)
    ) {
      Layout._verifyStyleSheetChanged(!_isVerifyingStyleSheet);

      _isVerifyingStyleSheet = true;
    } else {
      _isVerifyingStyleSheet = false;
    }

    if (Config.VerifyStyleSheetPeriodicaly) {
      // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
      requestAnimationFrame(() =>
        setTimeout(
          _verifyStyleSheetWorker,
          HtmlAlign.Config.VerifyStyleSheetPeriodicalyDelay
        )
      );
    } else if (isDevToolsOpen) {
      // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
      requestAnimationFrame(() =>
        setTimeout(_verifyStyleSheetWorker, HtmlAlign.Config.DevToolsOpenRefreshDelay)
      );
    } else {
      // request animation frame é utilizado apenas para parar a verificação quando a tela não está em foco
      requestAnimationFrame(() => setTimeout(_verifyStyleSheetWorker, 2000));
    }
  }

  let _lastStateDevTools = false;
  // eslint-disable-next-line no-inner-declarations
  function isDevToolsOpen(): boolean {
    const threshold = HtmlAlign.Config.DevToolsTreshhold;
    const widthThreshold =
      window.outerWidth - window.innerWidth * window.devicePixelRatio >
      threshold;
    const heightThreshold =
      window.outerHeight - window.innerHeight * window.devicePixelRatio >
      threshold;

    if (
      !(heightThreshold && widthThreshold) &&
      ((window['Firebug'] &&
        window['Firebug'].chrome &&
        window['Firebug'].chrome.isInitialized) ||
        widthThreshold ||
        heightThreshold)
    ) {
      _lastStateDevTools = true;
      return true;
    } else if (_lastStateDevTools) {
      _lastStateDevTools = false;
      return true;
    } else {
      return false;
    }
  }

  const observer = new MutationObserver(
    (mutations: MutationRecord[], observer: MutationObserver) => {
      const qtdList = mutations.length;
      for (let indexRecord = 0; indexRecord < qtdList; indexRecord++) {
        const mutationRecord: MutationRecord = mutations[indexRecord];
        // se foi uma atualização de texto ou de uma tag que não implementa nenhum comportamento
        // é feita uma pesquisa subindo na árvore DOM por qual é o primeiro componente pai em que
        // essa atualização está contida, se esse componente é um conteúdo é disparada uma rotina
        // de medida para verificar se o conteúdo necessita de um novo espaço para si
        if (
          mutationRecord.type == 'characterData' ||
          !mutationRecord.target['component']
        ) {
          let element = <HTMLElement>mutationRecord.target;
          while (element) {
            if (element['component']) {
              const component: Component = element['component'];

              if (component.behavior.name === 'in') {
                Layout._notifyCssPropertyChangedList.push(component);
                break;
              } else {
                break;
              }
            }

            element = element.parentElement;
          }
        } else {
          const component: Component = mutationRecord.target['component'];

          if (mutationRecord.attributeName) {
            const element = <HTMLElement>mutationRecord.target;

            // se o componente estiver congelado ou a atualização ocorreu no atributo style mas refere-se
            // apenas a atualização de posição conhecida não deve ser disparado uma medida
            if (
              mutationRecord.attributeName === 'style' &&
              element['laststyle'] === element.getAttribute('style')
            ) {
              continue;
            }

            Layout._notifyCssPropertyChangedList.push(component);
          }

          for (
            let index = 0;
            index < mutationRecord.removedNodes.length;
            index++
          ) {
            Layout._notifyChildrenChangedList.push(component);
          }

          // possível melhora, os elementos aparecem duplicados na lista
          for (
            let index = 0;
            index < mutationRecord.addedNodes.length;
            index++
          ) {
            Layout._notifyChildrenChangedList.push(component);
          }
        }
      }

      if (
        Layout._notifyChildrenChangedList.length > 0 ||
        Layout._notifyCssPropertyChangedList.length > 0
      ) {
        requestAnimationFrame(refreshLayout);
      }
    }
  );

  // eslint-disable-next-line no-inner-declarations
  function _init() {
    // realiza a primeira rotina de medição e arranjo
    Layout.init();

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
      Layout.refreshRootSize();
    });
  }

  console.log('executing');
  if (document.readyState === 'complete') {
    console.log('init by complete');
    _init();
  } else {
    window.addEventListener('load', function () {
      console.log('init by load');
      _init();
    });
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
    print: function () {
      console.log(
        'LayoutRefreshed: ' +
          Log.LayoutRefreshed.toString() +
          ';\nReadedCssProperties: ' +
          Log.ReadedCssProperties.toString() +
          ';\nAddedElements: ' +
          Log.AddedElements.toString() +
          ';\nRemovedElements: ' +
          Log.RemovedElements.toString() +
          ';\nRootMeasuresNotified: ' +
          Log.RootMeasuresNotified.toString() +
          ';\nRootScrollRemeasure: ' +
          Log.RootScrollMeasureAgain.toString() +
          ';\nLogicalRemeasure: ' +
          Log.LogicalMeasureAgain.toString() +
          ';\nBehaviorRemeasure: ' +
          Log.BehaviorMeasureAgain.toString() +
          ';\nMeasures: ' +
          Log.Measures.toString() +
          ';\nRootArrangesNotified: ' +
          Log.RootArrangesNotified.toString() +
          ';\nBehaviorArranges: ' +
          Log.BehaviorArranges.toString() +
          ';\nArranges: ' +
          Log.Arranges.toString()
      );
    }
  };
}

/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class BehaviorCssProperty implements ICssProperty {
    private regExpString = /^\s*(\w*).*$/;

    public name = '--behavior';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'panel';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.behavior = Layout.getBehavior(
        component,
        this.regExpString.exec(valueString)[1]
      );

      if (component.behavior != null) {
        component.behavior.component = component;
      }
    }

    public getValueStringFromComponent(component: Component): string {
      return Layout.getBehaviorName(component);
    }
  }

  export class AlignCssProperty implements ICssProperty {
    private regExpAlign =
      /^\s*(left|right|top|bottom|center|streach){0,1}\s*(left|right|top|bottom|center|streach){0,1}.*$/;

    public name = '--align';
    public context: CssPropertyContext = CssPropertyContext.component;

    public defaultValue(): string {
      return 'streach';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      const matchsAlign: RegExpExecArray = this.regExpAlign.exec(valueString);
      const horizontal: string = matchsAlign[1];
      const vertical: string = matchsAlign[2];

      component.horizontal.align = Align.streach;
      component.vertical.align = Align.streach;

      const nextAxis = this.ReadAlign(Axis.horizontal, horizontal, component);

      if (vertical == null) {
        if (horizontal == 'streach' || horizontal == 'center') {
          this.ReadAlign(nextAxis, horizontal, component);
        }
      } else {
        this.ReadAlign(nextAxis, vertical, component);
      }
    }

    public ReadAlign(
      axis: Axis,
      valueString: string,
      component: Component
    ): Axis {
      if (valueString == 'left') {
        if (axis == Axis.vertical) {
          component.vertical.align = component.horizontal.align;
        }

        component.horizontal.align = Align.start;
        return Axis.vertical;
      } else if (valueString == 'right') {
        if (axis == Axis.vertical) {
          component.vertical.align = component.horizontal.align;
        }

        component.horizontal.align = Align.end;
        return Axis.vertical;
      } else if (valueString == 'top') {
        component.vertical.align = Align.start;
        return Axis.horizontal;
      } else if (valueString == 'bottom') {
        component.vertical.align = Align.end;
        return Axis.horizontal;
      } else if (valueString == 'center') {
        component.getOnAxis(axis).align = Align.center;
        return Axis.vertical;
      } else {
        component.getOnAxis(axis).align = Align.streach;
        return Axis.vertical;
      }
    }

    public getValueStringFromComponent(component: Component): string {
      let horizontal = 'left';
      const vertical = 'top';

      if (component.horizontal.align == Align.end) {
        horizontal = 'right';
      } else if (component.horizontal.align == Align.center) {
        horizontal = 'center';
      } else if (component.horizontal.align == Align.streach) {
        horizontal = 'streach';
      }

      if (component.vertical.align == Align.end) {
        horizontal = 'bottom';
      } else if (component.vertical.align == Align.center) {
        horizontal = 'center';
      } else if (component.vertical.align == Align.streach) {
        horizontal = 'streach';
      }

      if (horizontal == vertical) {
        return horizontal;
      }

      return horizontal + ' ' + vertical;
    }
  }

  export class SizeCssProperty implements ICssProperty {
    private regExpSize =
      /^\s*(\d*[.]?\d*)([%]([[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?)(?:\s+(\d*[.]?\d*)([%]([[](\d*[.]?\d*)~(\d*[.]?\d*)[\]])?)?([~*]?)(\d*[.]?\d*)([%]?))?.*$/;
    private readonly Default = SizeRange.default();

    public name = '--size';
    public context: CssPropertyContext = CssPropertyContext.component;

    public defaultValue(): string {
      return '~';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      const matchsSize: RegExpExecArray = this.regExpSize.exec(valueString);

      component.horizontal.size = this.ReadSizeRange(
        matchsSize[1],
        matchsSize[2],
        matchsSize[4],
        matchsSize[5],
        matchsSize[6],
        matchsSize[7],
        matchsSize[8],
        this.Default
      );

      component.vertical.size = this.ReadSizeRange(
        matchsSize[9],
        matchsSize[10],
        matchsSize[12],
        matchsSize[13],
        matchsSize[14],
        matchsSize[15],
        matchsSize[16],
        component.horizontal.size
      );
    }

    public getValueStringFromComponent(component: Component): string {
      return (
        component.horizontal.size.toString() +
        ' ' +
        component.vertical.size.toString()
      );
    }

    public ReadSizeRange(
      min: string,
      minPercentDesc: string,
      minPercentValue: string,
      maxPercentValue: string,
      type: string,
      max: string,
      maxPercent: string,
      def: SizeRange
    ): SizeRange {
      if (minPercentDesc && minPercentDesc.length > 1) {
        return new SizeRange(
          0,
          parseFloat(min) || 100,
          parseFloat(minPercentValue) || 0,
          false,
          parseFloat(maxPercentValue) || Number.POSITIVE_INFINITY,
          false
        );
      }

      const minIsPercent = minPercentDesc == '%';
      const maxIsPercent = maxPercent == '%';

      if (!type && !min && min != '0') {
        return new SizeRange(
          def.star,
          0,
          def.min,
          def.minIsPercent,
          def.max,
          def.maxIsPercent
        );
      } else if (type == '~') {
        return new SizeRange(
          0,
          0,
          parseFloat(min) || 0,
          minIsPercent,
          parseFloat(max) || Number.POSITIVE_INFINITY,
          maxIsPercent
        );
      } else if (type == '*') {
        return new SizeRange(parseFloat(min) || 1, 0, 0, false, 0, false);
      } else if (min == '0') {
        return new SizeRange(0, 0, 0, false, 0, false);
      } else {
        return new SizeRange(
          0,
          0,
          parseFloat(min) || 0,
          minIsPercent,
          parseFloat(min) || Number.POSITIVE_INFINITY,
          minIsPercent
        );
      }
    }
  }

  export class DisplayCssProperty implements ICssProperty {
    public name = 'display';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'block';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      if (valueString.startsWith('none')) {
        component.isVisible = false;
      } else {
        component.isVisible = true;
      }
    }
    public getValueStringFromComponent(component: Component): string {
      if (component.isVisible) {
        return 'block';
      } else {
        return 'none';
      }
    }
  }

  export class OverflowCssProperty implements ICssProperty {
    private regExpScroll =
      /^\s*(auto|overlay|hidden|scroll|visible){0,1}\s*(auto|overlay|hidden|scroll|visible){0,1}.*$/;

    public name = 'overflow';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'visible';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      const matchsAlign: RegExpExecArray = this.regExpScroll.exec(valueString);
      const horizontal = matchsAlign[1];
      const vertical = matchsAlign[2] || horizontal;

      if (horizontal == 'auto' || horizontal == 'overlay') {
        component.horizontalScroll = Scroll.auto;
      } else if (horizontal == 'scroll') {
        component.horizontalScroll = Scroll.visible;
      } else {
        component.horizontalScroll = Scroll.none;
      }

      if (vertical == 'auto' || vertical == 'overlay') {
        component.verticalScroll = Scroll.auto;
      } else if (vertical == 'scroll') {
        component.verticalScroll = Scroll.visible;
      } else {
        component.verticalScroll = Scroll.none;
      }
    }
    public getValueStringFromComponent(component: Component): string {
      return '';
    }
  }

  export class MarginLeftCssProperty implements ICssProperty {
    public name = 'margin-left';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.margin.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.margin.start.toString() + 'px';
    }
  }

  export class MarginTopCssProperty implements ICssProperty {
    public name = 'margin-top';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.margin.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.margin.start.toString() + 'px';
    }
  }

  export class MarginRightCssProperty implements ICssProperty {
    public name = 'margin-right';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.margin.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.margin.end.toString() + 'px';
    }
  }

  export class MarginBottomCssProperty implements ICssProperty {
    public name = 'margin-bottom';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.margin.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.margin.end.toString() + 'px';
    }
  }

  export class BorderLeftCssProperty implements ICssProperty {
    public name = 'border-left-width';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.border.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.border.start.toString() + 'px';
    }
  }

  export class BorderTopCssProperty implements ICssProperty {
    public name = 'border-top-width';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.border.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.border.start.toString() + 'px';
    }
  }

  export class BorderRightCssProperty implements ICssProperty {
    public name = 'border-right-width';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.border.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.border.end.toString() + 'px';
    }
  }

  export class BorderBottomCssProperty implements ICssProperty {
    public name = 'border-bottom-width';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.border.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.border.end.toString() + 'px';
    }
  }

  export class PaddingLeftCssProperty implements ICssProperty {
    public name = 'padding-left';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.padding.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.padding.start.toString() + 'px';
    }
  }

  export class PaddingTopCssProperty implements ICssProperty {
    public name = 'padding-top';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.padding.start = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.padding.start.toString() + 'px';
    }
  }

  export class PaddingRightCssProperty implements ICssProperty {
    public name = 'padding-right';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.horizontal.padding.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.horizontal.padding.end.toString() + 'px';
    }
  }

  export class PaddingBottomCssProperty implements ICssProperty {
    public name = 'padding-bottom';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return null;
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      component.vertical.padding.end = Number.parseInt(valueString);
    }
    public getValueStringFromComponent(component: Component): string {
      return component.vertical.padding.end.toString() + 'px';
    }
  }

  export class PanelBehavior implements IBehavior {
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

    public name = 'panel';
    public component: Component;
    public isLayoutOverridedInArrange = false;

    public getNew() {
      return new PanelBehavior();
    }

    public getCssProperties(): ICssProperty[] {
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

    public measure(): void {
      let maxHorizontalContentSize = 0;
      let maxVerticalContentSize = 0;
      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];

        child.measure(
          this.component.horizontal.contentDelimiter,
          this.component.vertical.contentDelimiter
        );

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

    public arrange(): void {
      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];
        child.horizontal.givedSpace = this.component.horizontal.contentSpace;
        child.vertical.givedSpace = this.component.vertical.contentSpace;

        child.arrange();
      }
    }
  }
}

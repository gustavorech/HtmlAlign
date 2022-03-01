/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class WrapCssProperty implements ICssProperty {
    private regExpString = /^\s*(\w*).*$/;

    public name = '--wrap';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return 'left';
    }

    public setValueFromCssProperty(_valueString: string, component: Component) {
      const valueString = this.regExpString.exec(_valueString)[1];

      const wrapBehavior: WrapBehavior = <WrapBehavior>component.behavior;

      if (valueString == 'top') wrapBehavior._side = Side.top;
      else if (valueString == 'right') wrapBehavior._side = Side.right;
      else if (valueString == 'bottom') wrapBehavior._side = Side.bottom;
      else wrapBehavior._side = Side.left;
    }

    public getValueStringFromComponent(component: Component): string {
      const wrapBehavior: WrapBehavior = <WrapBehavior>component.behavior;

      if (wrapBehavior._side == Side.top) return 'top';
      else if (wrapBehavior._side == Side.right) return 'right';
      else if (wrapBehavior._side == Side.bottom) return 'bottom';
      else return 'left';
    }
  }

  export class WrapBehavior implements IBehavior {
    public name = 'wrap';
    public component: Component;
    public isLayoutOverridedInArrange = false;

    static WrapCssProperty = new WrapCssProperty();

    public getNew(): WrapBehavior {
      return new WrapBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [WrapBehavior.WrapCssProperty];
    }

    public _side: Side;

    // auxiliares
    private _wrapAxis: Axis;
    private _lines: WrapLine[] = [];

    public measure(): void {
      for (let index = 0; index < this.component.children.length; index++) {
        this.component.children[index].measure(
          this.component.horizontal.contentDelimiter,
          this.component.vertical.contentDelimiter
        );
      }

      this.ProcessLines(
        this.component.horizontal.contentDelimiter.max,
        this.component.vertical.contentDelimiter.max
      );

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

    public arrange(): void {
      const spaceInAxis: Space = this.component
        .getOnAxis(this._wrapAxis)
        .contentSpace.copy();
      const spaceInReverseAxis: Space = this.component
        .getPerpendicularToAxis(this._wrapAxis)
        .contentSpace.copy();

      const spaceInAxisCopy: Space = spaceInAxis.copy();

      for (let lineIndex = 0; lineIndex < this._lines.length; lineIndex++) {
        const line: WrapLine = this._lines[lineIndex];
        spaceInReverseAxis.size = line.MaxSizeInReverseAxis;

        for (let index = 0; index < line.Components.length; index++) {
          const child: Component = line.Components[index];
          const componentDesizerdSize = child.getOnAxis(
            this._wrapAxis
          ).componentRequired;

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

    private ProcessLines(horizontalMax: number, verticalMax: number): void {
      this._lines = [];
      this._wrapAxis = Axis.vertical;
      let maxSizeInAxis: number = verticalMax;
      if (this._side == Side.left || this._side == Side.right) {
        this._wrapAxis = Axis.horizontal;
        maxSizeInAxis = horizontalMax;
      }

      let currentLine: WrapLine = null;

      if (this._side == Side.left || this._side == Side.top) {
        for (let index = 0; index < this.component.children.length; index++) {
          const child: Component = this.component.children[index];

          if (currentLine == null || !currentLine.Add(child)) {
            currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
            this._lines.push(currentLine);
          }
        }
      } else {
        for (
          let index = this.component.children.length - 1;
          index >= 0;
          index--
        ) {
          const child: Component = this.component.children[index];

          if (currentLine == null || !currentLine.Add(child)) {
            currentLine = new WrapLine(this._wrapAxis, maxSizeInAxis, child);
            this._lines.push(currentLine);
          }
        }
      }
    }
  }

  export class WrapLine {
    public SumOfSizesInAxis: number;
    public MaxSizeInReverseAxis: number;
    public Components: Component[];

    constructor(
      public WrapAxis: Axis,
      public MaxSizeInAxis: number,
      component: Component
    ) {
      // Se é o primeiro elemento da linha não importa o tamanho dele, ele ficará nessa linha
      this.SumOfSizesInAxis = component.getOnAxis(
        this.WrapAxis
      ).componentRequired;
      this.MaxSizeInReverseAxis = component.getPerpendicularToAxis(
        this.WrapAxis
      ).componentRequired;

      this.Components = [];
      this.Components.push(component);
    }

    public Add(component: Component): boolean {
      const sizeInAxis: number = component.getOnAxis(
        this.WrapAxis
      ).componentRequired;
      const sizeInReverseAxis: number = component.getPerpendicularToAxis(
        this.WrapAxis
      ).componentRequired;

      // Se a adição do componente a essa linha faz com que o tamanho extrapole
      // o tamanho máximo esse componente não será inserido nessa linha
      if (
        Math.fround(this.SumOfSizesInAxis + sizeInAxis) >
        Math.fround(this.MaxSizeInAxis)
      ) {
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
}

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../Component.ts" />

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class BodyBehavior extends PanelBehavior implements IBehavior {
    public name = 'body';
    public isLayoutOverridedInArrange = false;

    // a medição desse comportamento é diferente, se forem componentes com máximos
    // percentuais respeita o tamanho da tela
    // se não permite que o componente cresça indefinidamente
    public measure(): void {
      const fixedHDelimiter = new SizeDelimiter(
        this.component.horizontal.size.min,
        this.component.horizontal.size.min
      );
      const fixedVDelimiter = new SizeDelimiter(
        this.component.vertical.size.min,
        this.component.vertical.size.min
      );

      let maxHorizontalContentSize = 0;
      let maxVerticalContentSize = 0;
      for (let index = 0; index < this.component.children.length; index++) {
        const child = this.component.children[index];

        if (
          child.horizontal.size.maxIsPercent &&
          child.vertical.size.maxIsPercent
        ) {
          child.measure(fixedHDelimiter, fixedVDelimiter);
        } else if (
          child.horizontal.size.maxIsPercent ||
          child.horizontal.size.delimiter > 0
        ) {
          child.measure(
            fixedHDelimiter,
            this.component.vertical.contentDelimiter
          );
        } else if (child.vertical.size.maxIsPercent) {
          child.measure(
            this.component.horizontal.contentDelimiter,
            fixedVDelimiter
          );
        } else {
          child.measure(
            this.component.horizontal.contentDelimiter,
            this.component.vertical.contentDelimiter
          );
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

    public arrange(): void {
      let needScrollVertical = false;
      let needScrollHorizontal = false;

      if (this.component.vertical.scroll == Scroll.auto) {
        const sizeVDesired =
          this.component.vertical.contentDesired +
          this.component.vertical.margin.sum() +
          this.component.vertical.border.sum() +
          this.component.vertical.padding.sum();

        if (sizeVDesired > this.component.vertical.size.min) {
          needScrollVertical = true;
        }
      }
      if (this.component.horizontal.scroll == Scroll.auto) {
        const sizeHDesired =
          this.component.horizontal.contentDesired +
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
        this.component.measure(
          SizeDelimiter.default(),
          SizeDelimiter.default()
        );

        this.component.horizontal.givedSpace = new Space(
          0,
          this.component.horizontal.componentRequired
        );
        this.component.vertical.givedSpace = new Space(
          0,
          this.component.vertical.componentRequired
        );

        this.component.horizontal.size.min += 17;
        this.component._canInformNeedArrangeInMeasure = true;

        Log.RootScrollMeasureAgain++;
      } else if (needScrollHorizontal && !needScrollVertical) {
        this.component._canInformNeedArrangeInMeasure = false;
        this.component.vertical.size.min -= 17;
        this.component.measure(
          SizeDelimiter.default(),
          SizeDelimiter.default()
        );

        this.component.horizontal.givedSpace = new Space(
          0,
          this.component.horizontal.componentRequired
        );
        this.component.vertical.givedSpace = new Space(
          0,
          this.component.vertical.componentRequired
        );

        this.component.vertical.size.min += 17;
        this.component._canInformNeedArrangeInMeasure = true;

        Log.RootScrollMeasureAgain++;
      } else if (needScrollVertical && needScrollVertical) {
        this.component._canInformNeedArrangeInMeasure = false;
        this.component.horizontal.size.min -= 17;
        this.component.vertical.size.min -= 17;
        this.component.measure(
          SizeDelimiter.default(),
          SizeDelimiter.default()
        );

        this.component.horizontal.givedSpace = new Space(
          0,
          this.component.horizontal.componentRequired
        );
        this.component.vertical.givedSpace = new Space(
          0,
          this.component.vertical.componentRequired
        );

        this.component.horizontal.size.min += 17;
        this.component.vertical.size.min += 17;
        this.component._canInformNeedArrangeInMeasure = true;

        Log.RootScrollMeasureAgain++;
      }

      super.arrange();
    }
  }
}

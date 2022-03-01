/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path='../Component.ts'/>

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class GridCssProperty implements ICssProperty {
    public name = '--grid';
    public context = CssPropertyContext.component;

    public defaultValue(): string {
      return '*, *';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      const regexValidateGrid =
        /^(\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+\s*[,](\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+.*$/;
      const regexGrid =
        /\s*((\d*[.]?\d*)([%]?)([~*])(\d*[.]?\d*)([%]?))|(\d+[.]?\d*)([%]?)|([,])/g;
      const gridBehavior = <GridBehavior>component.behavior;

      // verfica se a string está bem formada, se não estiver deixa os valores padrões e retorna
      if (!regexValidateGrid.test(valueString)) {
        gridBehavior.Columns = [SizeRange.default()];
        gridBehavior.Rows = [SizeRange.default()];

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

          sizeRange = new SizeRange(0, 0, value, isPercent, value, isPercent);
        }
        // se for estrela ou tiver um espaço de valores
        else {
          const min = matchs[2];
          const minIsPercent = matchs[3];
          const type = matchs[4];
          const max = matchs[5];
          const maxIsPercent = matchs[6];

          if (!type && !min && min != '0') {
            sizeRange = SizeRange.default();
          } else if (type == '~') {
            sizeRange = new SizeRange(
              0,
              0,
              parseFloat(min) || 0,
              minIsPercent,
              parseFloat(max) || Number.POSITIVE_INFINITY,
              maxIsPercent
            );
          } else if (type == '*') {
            sizeRange = new SizeRange(
              parseFloat(min) || 1,
              0,
              0,
              false,
              0,
              false
            );
          } else if (min == '0') {
            sizeRange = new SizeRange(0, 0, 0, false, 0, false);
          } else {
            sizeRange = new SizeRange(
              0,
              0,
              parseFloat(min) || 0,
              minIsPercent,
              parseFloat(min) || Number.POSITIVE_INFINITY,
              minIsPercent
            );
          }
        }

        // verifica se adicionará nas colunas ou na linhas
        if (rows) {
          gridBehavior.Rows.push(sizeRange);
        } else {
          gridBehavior.Columns.push(sizeRange);
        }
      }

      // se não tem colunas colca o valor default
      if (gridBehavior.Columns.length == 0) {
        gridBehavior.Columns = [SizeRange.default()];
      }

      // se não tem linhas colca o valor default
      if (gridBehavior.Rows.length == 0) {
        gridBehavior.Rows = [SizeRange.default()];
      }
    }

    public getValueStringFromComponent(component: Component): string {
      const gridBehavior = <GridBehavior>component.behavior;

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

  export class GridPlaceCssProperty implements ICssProperty {
    private regExpPlace = /^\s*(\d*)\s*(\d*).*$/;

    public name = '--place';
    public context = CssPropertyContext.child;

    public defaultValue(): string {
      return '0 0';
    }

    public setValueFromCssProperty(valueString: string, component: Component) {
      const matchs = this.regExpPlace.exec(valueString);

      if (matchs[1] != undefined) {
        component.parentAttached['Column'] = parseInt(matchs[1]);
      } else {
        component.parentAttached['Column'] = 0;
      }

      if (matchs[2] != undefined) {
        component.parentAttached['Row'] = parseInt(matchs[2]);
      } else {
        component.parentAttached['Row'] = 0;
      }
    }

    public getValueStringFromComponent(component: Component): string {
      return (
        component.parentAttached['Column'] +
        ' ' +
        component.parentAttached['Row']
      );
    }
  }

  export class GridBehavior implements IBehavior {
    public name = 'grid';
    public component: Component;
    public isLayoutOverridedInArrange = false;

    static GridCssProperty = new GridCssProperty();
    static GridPlaceCssProperty = new GridPlaceCssProperty();

    public getNew() {
      return new GridBehavior();
    }

    public getCssProperties(): ICssProperty[] {
      return [GridBehavior.GridCssProperty, GridBehavior.GridPlaceCssProperty];
    }

    public Columns: SizeRange[];
    public Rows: SizeRange[];

    private _places: Component[];
    private _columnsMaxSizes: number[];
    private _rowsMaxSizes: number[];

    private _columnStarCount: number;
    private _rowStarCount: number;
    private _totalColumnDesiredSizeNotStar: number;
    private _totalRowDesiredSizeNotStar: number;

    public measure(): void {
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

      for (
        let indexColumn = 0;
        indexColumn < this.Columns.length;
        indexColumn++
      ) {
        this._columnsMaxSizes.push(0);

        if (this.Columns[indexColumn].star > 0) {
          this._columnStarCount += this.Columns[indexColumn].star;
        }

        for (let indexRow = 0; indexRow < this.Rows.length; indexRow++) {
          const place = new Component(this.component, undefined);
          place.horizontal.size = this.Columns[indexColumn];
          place.vertical.size = this.Rows[indexRow];

          for (
            let indexChild = 0;
            indexChild < this.component.children.length;
            indexChild++
          ) {
            const child = this.component.children[indexChild];

            if (
              child.parentAttached['Column'] == indexColumn &&
              child.parentAttached['Row'] == indexRow
            ) {
              place.children.push(child);
            }
          }

          this._places.push(place);
          if (place.horizontal.star == 0 || place.vertical.star == 0) {
            place.measure(
              this.component.horizontal.contentDelimiter,
              this.component.vertical.contentDelimiter
            );

            if (
              place.horizontal.star == 0 &&
              place.horizontal.componentRequired >
                this._columnsMaxSizes[indexColumn]
            ) {
              this._columnsMaxSizes[indexColumn] =
                place.horizontal.componentRequired;
            }

            if (
              place.vertical.star == 0 &&
              place.vertical.componentRequired > this._rowsMaxSizes[indexRow]
            ) {
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

    public arrange(): void {
      if (
        this._columnStarCount > 0 &&
        this.component.horizontal.componentSpace.size >
          this._totalColumnDesiredSizeNotStar
      ) {
        const columnStarProportion =
          (this.component.horizontal.componentSpace.size -
            this._totalColumnDesiredSizeNotStar) /
          this._columnStarCount;

        for (
          let indexColumn = 0;
          indexColumn < this.Columns.length;
          indexColumn++
        ) {
          if (this.Columns[indexColumn].star > 0) {
            this._columnsMaxSizes[indexColumn] =
              columnStarProportion * this.Columns[indexColumn].star;
          }
        }
      }

      if (
        this._rowStarCount > 0 &&
        this.component.vertical.componentSpace.size >
          this._totalRowDesiredSizeNotStar
      ) {
        const rowStarProportion =
          (this.component.vertical.componentSpace.size -
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
        } else {
          rowDisplacement += rowSize;
        }

        rowSize = this._rowsMaxSizes[rowPostion];

        if (columnPosition < Math.floor(indexPlace / quantityOfRows)) {
          columnPosition++;
          columnDisplacement += columnSize;
          columnSize = this._columnsMaxSizes[columnPosition];
        }

        place.horizontal.givedSpace = new Space(
          this.component.horizontal.contentSpace.displacement +
            columnDisplacement,
          columnSize
        );
        place.vertical.givedSpace = new Space(
          this.component.vertical.contentSpace.displacement + rowDisplacement,
          rowSize
        );

        place.arrange();
      }
    }
  }
}

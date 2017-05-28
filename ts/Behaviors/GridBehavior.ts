
/// <reference path='../Component.ts'/>

namespace HtmlAlign {

    export class GridCssProperty implements ICssProperty {

        public Name = "--grid";
        public Context = CssPropertyContext.Component;

        public DefaultValue(): string {
            return "*, *";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
            var regexValidateGrid: RegExp = /^(\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+\s*[,](\s*((\d*[.]?\d*[%]?[~*]\d*[.]?\d*[%]?)|\d+[.]?\d*[%]?))+.*$/;
            var regexGrid: RegExp = /\s*((\d*[.]?\d*)([%]?)([~*])(\d*[.]?\d*)([%]?))|(\d+[.]?\d*)([%]?)|([,])/g;
            var gridBehavior = <GridBehavior>component.Behavior;

            // verfica se a string está bem formada, se não estiver deixa os valores padrões e retorna
            if (!regexValidateGrid.test(valueString)) {
                gridBehavior.Columns = [SizeRange.Default()];
                gridBehavior.Rows = [SizeRange.Default()];

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

                    sizeRange = new SizeRange(0, value, isPercent, value, isPercent);

                }
                // se for estrela ou tiver um espaço de valores
                else {
                    var min = matchs[2];
                    var minIsPercent = matchs[3];
                    var type = matchs[4];
                    var max = matchs[5];
                    var maxIsPercent = matchs[6];


                    if (!type && !min && min != "0") {
                        sizeRange = SizeRange.Default();
                    }
                    else if (type == "~") {
                        sizeRange = new SizeRange(0, parseFloat(min) || 0, minIsPercent,
                            parseFloat(max) || Number.POSITIVE_INFINITY, maxIsPercent);
                    }
                    else if (type == "*") {
                        sizeRange = new SizeRange(parseFloat(min) || 1, 0, false, 0, false);
                    }
                    else if (min == "0") {
                        sizeRange = new SizeRange(0, 0, false, 0, false);
                    }
                    else {
                        sizeRange = new SizeRange(0, parseFloat(min) || 0, minIsPercent,
                            parseFloat(min) || Number.POSITIVE_INFINITY, minIsPercent);
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
                gridBehavior.Columns = [SizeRange.Default()];
            }

            // se não tem linhas colca o valor default
            if (gridBehavior.Rows.length == 0) {
                gridBehavior.Rows = [SizeRange.Default()];
            }
        }

        public GetValueStringFromComponent(component: Component): string {
            var gridBehavior = <GridBehavior>component.Behavior;

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

    export class GridPlaceCssProperty implements ICssProperty {
        private regExpPlace: RegExp = /^\s*(\d*)\s*(\d*).*$/;

        public Name = "--place";
        public Context = CssPropertyContext.Child;

        public DefaultValue(): string {
            return "0 0";
        }

        public SetValueFromCssProperty(valueString: string, component: Component) {
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

        public GetValueStringFromComponent(component: Component): string {
            return component.FatherAttached["Column"] + " " + component.FatherAttached["Row"];
        }
    }

    export class GridBehavior implements IBehavior {
        public Name = "grid"; 
        public Component: Component;
        public IsLayoutOverridedInArrange = false;

        static GridCssProperty = new GridCssProperty();
        static GridPlaceCssProperty = new GridPlaceCssProperty();

        public GetNew() {
            return new GridBehavior();
        }

        public GetCssProperties(): ICssProperty[] {
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

        public Measure(): void {
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
                    var place = new Component(this.Component, undefined);
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

        public Arrange(): void {

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

                place.H.GivedSpace = new Space(this.Component.H.ContentSpace.Displacement + columnDisplacement, columnSize);
                place.V.GivedSpace = new Space(this.Component.V.ContentSpace.Displacement + rowDisplacement, rowSize);

                place.Arrange();
            }
        }
    }
}
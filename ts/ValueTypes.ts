

namespace HtmlAlign {
    
    export class Rect implements IValueType, ITwoDimensionalSet<number> {
        static Default(): Rect { return new Rect(0, 0); }

        constructor(public H: number, public V: number) { }

        public Copy(): Rect { return new Rect(this.H, this.V); }
        public CopyFrom(obj: Rect): void {
            this.H = obj.H;
            this.V = obj.V;
        }

        public Get(axis: Axis): number {
            if (axis == Axis.Horizontal) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        public GetAwry(axis: Axis): number {
            if (axis == Axis.Vertical) {
                return this.H;
            }
            else {
                return this.V;
            }
        }
        public Set(axis: Axis, value: number): void {
            if (axis == Axis.Horizontal) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
        public SetAwry(axis: Axis, value: number): void {
            if (axis == Axis.Vertical) {
                this.H = value;
            }
            else {
                this.V = value;
            }
        }
    }

    // Espaço ocupado por uma dimensão de um retângulo, possui as informações
    // de deslocamente desde a origem e de deslocamento relativo ao componente pai
    // junto a informação do tamanho do retângulo nessa dimensão
    export class Space implements IValueType {
        static Default(): Space { return new Space(0, 0); }

        constructor(public Displacement: number, public Size: number) { }

        public Copy(): Space { return new Space(this.Displacement, this.Size); }
        public CopyFrom(obj: Space): void {
            this.Displacement = obj.Displacement;
            this.Size = obj.Size;
        }
    }

    // Grossura de uma linha ou espaço em uma dimensão, tem as informações de grossura
    // no início da dimensão e no fim da dimensão
    export class Thickness implements IValueType {
        constructor(public Start: number, public End: number) { }

        public Copy(): Thickness { return new Thickness(this.Start, this.End); }
        static Default(): Thickness { return new Thickness(0, 0); }

        public CopyFrom(thickness: Thickness): void {
            this.Start = thickness.Start;
            this.End = thickness.End;
        }

        public Sum(): number {
            return this.Start + this.End;
        }
    }

    // Especifica a extensão de tamanhos aceitos pelo componente em uma dimensão
    // se os valores de mínimos e máximos forem iguais indica que o componente tem
    // um tamanho fixo. Também há o valor estrela que indica tamanho proporcional
    export class SizeRange implements IValueType {
        static Default(): SizeRange { return new SizeRange(0, 0, false, Number.POSITIVE_INFINITY, false); }

        constructor(public Star: number, public Min: number, public MinIsPercent: boolean, public Max: number, public MaxIsPercent: boolean) {
            // inverte valores caso necessário, feito apenas na criação
            if (this.MinIsPercent == this.MaxIsPercent
                && this.Min > this.Max) {

                var swap = this.Min;
                this.Min = this.Max;
                this.Max = swap;

            }
        }

        public Copy(): SizeRange { return new SizeRange(this.Star, this.Min, this.MinIsPercent, this.Max, this.MaxIsPercent); }
        public CopyFrom(obj: SizeRange): void {
            this.Star = obj.Star;
            this.Min = obj.Min;
            this.MinIsPercent = obj.MinIsPercent;
            this.Max = obj.Max;
            this.MaxIsPercent = obj.MaxIsPercent;
        }

        public toString(): string {
            if (this.Star > 0) {
                return this.Star + "*";
            }
            else if (this.Max == Number.POSITIVE_INFINITY) {
                if (this.Min == 0) {
                    return "~";
                }
                else {
                    return this.Min + "~";
                }
            }
            else if (this.Min == 0) {
                return "~" + this.Max;
            }
            else if (this.Min == this.Max) {
                return this.Min.toString();
            }
            else {
                return this.Min + "~" + this.Max;
            }
        }
    }

    export class SizeDelimiter implements IValueType {
        static Default(): SizeDelimiter { return new SizeDelimiter(0, Number.POSITIVE_INFINITY); }

        constructor(public Min: number, public Max: number) { }

        public Copy(): SizeDelimiter { return new SizeDelimiter(this.Min, this.Max); }
        public CopyFrom(obj: SizeDelimiter): void {
            this.Min = obj.Min;
            this.Max = obj.Max;
        }
    }
}
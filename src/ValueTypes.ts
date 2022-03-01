// eslint-disable-next-line @typescript-eslint/no-namespace
namespace HtmlAlign {
  export class Rect implements IValueType, ITwoDimensionalSet<number> {
    static default(): Rect {
      return new Rect(0, 0);
    }

    constructor(public horizontal: number, public vertical: number) {}

    public copy(): Rect {
      return new Rect(this.horizontal, this.vertical);
    }
    public copyFrom(obj: Rect): void {
      this.horizontal = obj.horizontal;
      this.vertical = obj.vertical;
    }

    public getOnAxis(axis: Axis): number {
      if (axis == Axis.horizontal) {
        return this.horizontal;
      } else {
        return this.vertical;
      }
    }
    public getPerpendicularToAxis(axis: Axis): number {
      if (axis == Axis.vertical) {
        return this.horizontal;
      } else {
        return this.vertical;
      }
    }
    public setOnAxis(axis: Axis, value: number): void {
      if (axis == Axis.horizontal) {
        this.horizontal = value;
      } else {
        this.vertical = value;
      }
    }
    public setPerpendicularToAxis(axis: Axis, value: number): void {
      if (axis == Axis.vertical) {
        this.horizontal = value;
      } else {
        this.vertical = value;
      }
    }
  }

  // Espaço ocupado por uma dimensão de um retângulo, possui as informações
  // de deslocamente desde a origem e de deslocamento relativo ao componente pai
  // junto a informação do tamanho do retângulo nessa dimensão
  export class Space implements IValueType {
    static default(): Space {
      return new Space(0, 0);
    }

    constructor(public displacement: number, public size: number) {}

    public copy(): Space {
      return new Space(this.displacement, this.size);
    }
    public copyFrom(obj: Space): void {
      this.displacement = obj.displacement;
      this.size = obj.size;
    }
  }

  // Grossura de uma linha ou espaço em uma dimensão, tem as informações de grossura
  // no início da dimensão e no fim da dimensão
  export class Thickness implements IValueType {
    constructor(public start: number, public end: number) {}

    public copy(): Thickness {
      return new Thickness(this.start, this.end);
    }
    static default(): Thickness {
      return new Thickness(0, 0);
    }

    public copyFrom(thickness: Thickness): void {
      this.start = thickness.start;
      this.end = thickness.end;
    }

    public sum(): number {
      return this.start + this.end;
    }
  }

  // Especifica a extensão de tamanhos aceitos pelo componente em uma dimensão
  // se os valores de mínimos e máximos forem iguais indica que o componente tem
  // um tamanho fixo. Também há o valor estrela que indica tamanho proporcional
  export class SizeRange implements IValueType {
    static default(): SizeRange {
      return new SizeRange(0, 0, 0, false, Number.POSITIVE_INFINITY, false);
    }

    constructor(
      public star: number,
      public delimiter: number,
      public min: number,
      public minIsPercent: boolean,
      public max: number,
      public maxIsPercent: boolean
    ) {
      // inverte valores caso necessário, feito apenas na criação
      if (this.minIsPercent == this.maxIsPercent && this.min > this.max) {
        const swap = this.min;
        this.min = this.max;
        this.max = swap;
      }
    }

    public copy(): SizeRange {
      return new SizeRange(
        this.star,
        this.delimiter,
        this.min,
        this.minIsPercent,
        this.max,
        this.maxIsPercent
      );
    }
    public copyFrom(obj: SizeRange): void {
      this.star = obj.star;
      this.delimiter = obj.delimiter;
      this.min = obj.min;
      this.minIsPercent = obj.minIsPercent;
      this.max = obj.max;
      this.maxIsPercent = obj.maxIsPercent;
    }

    public toString(): string {
      if (this.star > 0) {
        return this.star + '*';
      } else if (this.max == Number.POSITIVE_INFINITY) {
        if (this.min == 0) {
          return '~';
        } else {
          return this.min + '~';
        }
      } else if (this.min == 0) {
        return '~' + this.max;
      } else if (this.min == this.max) {
        return this.min.toString();
      } else {
        return this.min + '~' + this.max;
      }
    }
  }

  export class SizeDelimiter implements IValueType {
    static default(): SizeDelimiter {
      return new SizeDelimiter(0, Number.POSITIVE_INFINITY);
    }

    constructor(public min: number, public max: number) {}

    public copy(): SizeDelimiter {
      return new SizeDelimiter(this.min, this.max);
    }
    public copyFrom(obj: SizeDelimiter): void {
      this.min = obj.min;
      this.max = obj.max;
    }
  }
}

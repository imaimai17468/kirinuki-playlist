export class UniqueConstraintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UniqueConstraintError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

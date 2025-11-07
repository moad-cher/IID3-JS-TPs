export enum Status {
    Read = 'Read',
    ReRead = 'Re-read',
    DNF = 'DNF',
    CurrentlyReading = 'Currently reading',
    ReturnedUnread = 'Returned Unread',
    WantToRead = 'Want to read'
}

export enum Format {
    Print = 'Print',
    PDF = 'PDF',
    Ebook = 'Ebook',
    AudioBook = 'AudioBook'
}

export class Book {
    id?: string;
    title: string;
    author: string;
    pages: number;
    status: Status;
    price: number;
    pages_read: number;
    format: Format;
    suggested_by: string;
    finished: boolean;

    constructor(title: string, author: string, pages: number, status: Status, price: number, pages_read = 0, format: Format = Format.Print, suggested_by = '', finished = false, id?: string) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.status = status;
        this.price = price;
        this.pages_read = pages_read;
        this.format = format;
        this.suggested_by = suggested_by;
        // finished is 0 (false) by default; if pages_read equals pages, mark finished true
        this.finished = finished || (this.pages_read >= this.pages && this.pages > 0);
    }

    // returns percentage read (0-100)
    currentlyAt(): number {
        if (!this.pages || this.pages <= 0) return 0;
        const pct = Math.round((this.pages_read / this.pages) * 100);
        // auto set finished
        if (this.pages_read >= this.pages) this.finished = true;
        return Math.min(100, Math.max(0, pct));
    }

    // client-side delete helper (actual deletion happens on server)
    deleteBook(): Promise<void> {
        if (!this.id) return Promise.resolve();
        return fetch('/books/' + this.id, { method: 'DELETE' }).then(() => {});
    }
}

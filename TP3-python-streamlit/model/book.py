class Book:
    def __init__(self, title, author, pages, status, price, pages_read=0, format='Print', suggested_by='', finished=False):
        self.title = title
        self.author = author
        self.pages = pages
        self.status = status
        self.price = price
        self.pages_read = pages_read
        self.format = format
        self.suggested_by = suggested_by
        self.finished = finished

    def currently_at(self):
        if not self.pages or self.pages <= 0:
            return 0
        pct = round((self.pages_read / self.pages) * 100)
        if self.pages_read >= self.pages:
            self.finished = True
        return min(100, max(0, pct))

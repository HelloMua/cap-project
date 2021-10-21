namespace my.bookshop;

entity Books {
  key ID : String;
  title  : localized String;
  author : Association to Authors;
  stock  : String;
  ploat : String(500);
}

entity Authors {
  key ID : String;
  name   : String;
  books  : Association to many Books on books.author = $self;
}
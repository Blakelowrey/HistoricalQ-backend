CREATE TABLE entries (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name text not NULL,
    description text,
    YOB INT,
    EOB text,
    POB text,
    YOD int,
    EOD text,
    POD text
);

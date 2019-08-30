(defmodule hoshi
    (export
        (typecheck 2)
    )
    (export-macro tvoid)
)

(defrecord typeerror
    type
    value
    (reason #"")
)

(defmacro tvoid () `(map #"_t" #"type-basic" #"name" #"void"))

(defun typecheck
    (((tvoid) x) (make-typeerror type #"bla" value x))
    ((x y) #"wtf!")
)

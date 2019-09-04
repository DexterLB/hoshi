(defmodule hoshi
    (export
        (typecheck 2)
        (setmeta 2)
    )
    (export-macro tvoid tnull tbool tint tfloat tstring
                  tliteral tunion tmap tlist tstruct mvoid)
)

(defrecord typeerror
    type
    value
    (reason #"")
)

(defun setmeta (type meta) (map-set type #"_meta" meta))

(defmacro mvoid (meta) (setmeta (tvoid) meta))

(defmacro tvoid   () `(map #"_t" #"type-basic" #"name" #"void"))
(defmacro tnull   () `(map #"_t" #"type-basic" #"name" #"null"))
(defmacro tbool   () `(map #"_t" #"type-basic" #"name" #"bool"))
(defmacro tint    () `(map #"_t" #"type-basic" #"name" #"int"))
(defmacro tfloat  () `(map #"_t" #"type-basic" #"name" #"float"))
(defmacro tstring () `(map #"_t" #"type-basic" #"name" #"string"))

(defmacro tliteral (val)    `(map #"_t" #"type-literal" #"value"  ,val))
(defmacro tunion   (alts)   `(map #"_t" #"type-union"   #"alts"   ,alts))
(defmacro tmap     (k v)    `(map #"_t" #"type-map"     #"key"    ,k     #"value" ,v))
(defmacro tlist    (v)      `(map #"_t" #"type-list"    #"value"  ,v))
(defmacro tstruct  fields   `(map #"_t" #"type-struct"  #"fields" (eval (cons map ,fields))))

(defun typecheck
    (((tvoid) x) (make-typeerror type #"bla" value x))
    ((x y) #"wtf!")
)

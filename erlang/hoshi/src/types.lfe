(defmodule hoshi
    (export
        (typecheck 2)
        (setmeta 2)
        (tvoid 0)    (tnull 0)  (tbool 0) (tint 0)  (tfloat 0)  (tstring 0)
        (tliteral 1) (tunion 1) (tmap 2)  (tlist 1) (tstruct 1)
    )
    (export-macro mvoid)
)

(defrecord typeerror
    type
    value
    (reason #"")
)

(defun setmeta (type meta) (map-set type #"_meta" meta))

(eval-when-compile
    (defun setmeta2 (type meta) (map-set type #"_meta" meta))
    (defun make-map
        (( (list) ) (map))
        (( items  ) (map-set (make-map (cdr items)) (caar items) (cadar items)))
    )
    (defun tvoid2   () (map #"kind" #"type-basic" #"sub" #"void"))
)

(defmacro mvoid meta `,(setmeta2 (tvoid2) (make-map meta)))

(defun tvoid   () (map #"kind" #"type-basic" #"sub" #"void"))
(defun tnull   () (map #"kind" #"type-basic" #"sub" #"null"))
(defun tbool   () (map #"kind" #"type-basic" #"sub" #"bool"))
(defun tint    () (map #"kind" #"type-basic" #"sub" #"int"))
(defun tfloat  () (map #"kind" #"type-basic" #"sub" #"float"))
(defun tstring () (map #"kind" #"type-basic" #"sub" #"string"))

(defun tliteral (val)    (map #"kind" #"type-literal" #"value"  val))
(defun tunion   (alts)   (map #"kind" #"type-union"   #"alts"   alts))
(defun tmap     (k v)    (map #"kind" #"type-map"     #"key"    k     #"value" v))
(defun tlist    (v)      (map #"kind" #"type-list"    #"value"  v))
(defun tstruct  (fields) (map #"kind" #"type-struct"  #"fields" (eval (cons 'map fields))))

(defun typecheck
    (((mvoid (1 2)) x) (make-typeerror type #"bla" value x))
    (((tvoid) x) (make-typeerror type #"bla" value x))
    ((x y) #"wtf!")
)

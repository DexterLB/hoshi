(ns hoshi.core
  (:gen-class))

(defn tvoid   [] {"kind" "type-basic", "sub" "void"})
(defn tnull   [] {"kind" "type-basic", "sub" "null"})
(defn tbool   [] {"kind" "type-basic", "sub" "bool"})
(defn tint    [] {"kind" "type-basic", "sub" "int"})
(defn tfloat  [] {"kind" "type-basic", "sub" "float"})
(defn tstring [] {"kind" "type-basic", "sub" "string"})

(defn tliteral [val]      {"kind" "type-literal", "value"  val})
(defn tunion   [alts]     {"kind" "type-union",   "alts"   alts})
(defn tmap     [k v]      {"kind" "type-map",     "key"    k     "value" ,v})
(defn tlist    [v]        {"kind" "type-list",    "value"  v})
(defn tstruct  [fields]   {"kind" "type-struct",  "fields" fields})


(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (println (tlist (tvoid)))
)

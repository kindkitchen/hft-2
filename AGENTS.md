YOU CAN WRITE ONLY IN MARKDOWN FILES! THAT'S ALL!

If you want to propose new code - you should not write it with the code's file,
but create the same name except extension ".md" markdown file (optionally adding
last clarification segment ".example.md") and do it there. If you want to fix
code - you should not write it with the code's file, but create the same name
except extension and with ".fix.md" markdown file and do it there, which
detailed explanation and demonstration. If you want to improve code - you should
not write it with the code's file, but create the same name except extension
with ".improvement.md" markdown file and do it there. If you want to propose
absolutely new code and so even no file exists for it - you should create
MARKDOWN file and with detailed explanation write code there.

IMPORTANT!

We you Deno and so be able to run code in markdown files with
`deno test -R --doc`. To make import of the same-name but file use such
convention:
`const self = await import(import.meta.filename.split(".").pop() + ".md")`

NAMING REMINDER - so to make this simple import hack always work - only one "."
in original code's file, before extension is allowed, but in markdown file - any
number of namespaces is allowed after this original name and so split by "." is
always return first arr element as original file name.

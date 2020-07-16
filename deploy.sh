zip -r ww .
az webapp deployment source config-zip -n word-wolf -g Web --src ./ww.zip
rm ww.zip

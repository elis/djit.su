#!/bin/bash

THEMES_SOURCE="src/djitsu/theme/themes"
THEMES_DESTINATION="src/dist/themes"
THEMES_PUBLIC="themes"
THEMES_DESTINATION_MONACO="src/dist/themes/monaco"
THEMES_DESTINATION_CSS="src/dist/themes/css"
LESSC="yarn lessc --js %s %s %s"
THEMES=`find ./${THEMES_SOURCE}/ -name "*-theme" -type d -exec basename {} \;`

THEMES_JSON="{"
for THEME in $THEMES;
do
  VARS=`node ${THEMES_SOURCE}/vscode-to-djitsu.js ${THEME}`
  INPUT="${THEMES_SOURCE}/${THEME}/theme.less"
  OUTPUT="${THEMES_DESTINATION}/${THEME}.css"
  PUBLIC="${THEMES_PUBLIC}/${THEME}.css"
  MONACO_THEME="node ${THEMES_SOURCE}/vscode-to-monaco.js ${THEME}"
  MONACO_FILE="${THEMES_DESTINATION_MONACO}/${THEME}.json"
  CSS_VARS="node ${THEMES_SOURCE}/vscode-to-css-vars.js ${THEME}"
  CSS_VARS_FILE="${THEMES_DESTINATION_CSS}/${THEME}.css"

  if [ ! -d $THEMES_DESTINATION_CSS ]; then
    mkdir $THEMES_DESTINATION_CSS
  fi
    eval "${CSS_VARS} > ${CSS_VARS_FILE}"

  EXEC=`printf "${LESSC}" "${VARS}" "${INPUT}" "${OUTPUT}"`
  eval $EXEC
  THEMES_JSON+="\"${THEME}\": \"${PUBLIC}\","
  if [ ! -d $THEMES_DESTINATION_MONACO ]; then
    mkdir $THEMES_DESTINATION_MONACO
  fi

  eval "${MONACO_THEME} > ${MONACO_FILE}"
done

THEMES_JSON=`echo "$(echo ${THEMES_JSON} | sed 's/,*$//g')}"`
echo "${THEMES_JSON}" > $(echo "${THEMES_DESTINATION}/themes.json")

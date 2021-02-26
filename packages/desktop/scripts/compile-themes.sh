#!/bin/bash

THEMES_SOURCE="src/theme/themes"
THEMES_DESTINATION="src/dist/themes"
THEMES_PUBLIC="themes"
THEMES_DESTINATION_MONACO="src/dist/themes/monaco"
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

  EXEC=`printf "${LESSC}" "${VARS}" "${INPUT}" "${OUTPUT}"`
  eval $EXEC
  THEMES_JSON+="\"${THEME}\": \"${PUBLIC}\","
  if [ -d $THEMES_DESTINATION_MONACO ]; then
    RED="yes";
  else
    mkdir $THEMES_DESTINATION_MONACO
  fi

  eval "${MONACO_THEME} > ${MONACO_FILE}"
done

THEMES_JSON=`echo "$(echo ${THEMES_JSON} | sed 's/,*$//g')}"`
echo "${THEMES_JSON}" > $(echo "${THEMES_DESTINATION}/themes.json")

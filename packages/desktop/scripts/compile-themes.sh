#!/bin/bash

THEMES_SOURCE="src/djitsu/theme/themes"
THEMES_DESTINATION="src/dist/themes"
THEMES_PUBLIC="themes"
THEMES_DESTINATION_MONACO="src/dist/themes/monaco"
THEMES_DESTINATION_CSS="src/dist/themes/css"
LESSC="yarn lessc --js %s %s %s"
THEMES=$(find ./${THEMES_SOURCE}/ -name "*-theme" -type d -exec basename {} \;)

THEMES_JSON="{"
for THEME in $THEMES; do

  THEME_JSON_FILE=$THEMES_SOURCE/$THEME/theme.json
  THEME_LESS_FILE=$THEMES_SOURCE/$THEME/theme.less
  THEME_MONACO_FILE=$THEMES_SOURCE/$THEME/monaco.json

  if ! test -f "$THEME_JSON_FILE"; then
    echo "There is no theme.json file for ${THEME}, skipping"

  else
    VARS=$(node ${THEMES_SOURCE}/vscode-to-djitsu.js ${THEME})

    if ! test -f "$THEME_LESS_FILE"; then

      while true; do
        echo "🎨🎨 New Theme Found ${THEME}"
        read -p "🎨 Is ${THEME} a light theme ? [Y/n] " yn
        case $yn in
        [Yy]*)
          cp ${THEMES_SOURCE}/djitsu-dark-theme/theme.less ${THEMES_SOURCE}/${THEME}/theme.less
          cp ${THEMES_SOURCE}/djitsu-dark-theme/variables-dark.less ${THEMES_SOURCE}/${THEME}/variables-light.less
          break
          ;;
        [Nn]*)
          cp ${THEMES_SOURCE}/djitsu-dark-theme/theme.less ${THEMES_SOURCE}/${THEME}/theme.less
          cp ${THEMES_SOURCE}/djitsu-dark-theme/variables-dark.less ${THEMES_SOURCE}/${THEME}/variables-dark.less

          break
          ;;
        *) echo "Please answer yes or no." ;;
        esac
      done

    else

      INPUT="${THEMES_SOURCE}/${THEME}/theme.less"
    fi

    if ! test -f "$THEME_MONACO_FILE"; then
      touch $THEME_MONACO_FILE
      npx monaco-vscode-textmate-theme-converter -i $THEME_JSON_FILE -o $THEME_MONACO_FILE
    fi

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

    EXEC=$(printf "${LESSC}" "${VARS}" "${INPUT}" "${OUTPUT}")
    eval $EXEC
    THEMES_JSON+="\"${THEME}\": \"${PUBLIC}\","
    if [ ! -d $THEMES_DESTINATION_MONACO ]; then
      mkdir $THEMES_DESTINATION_MONACO
    fi

    eval "${MONACO_THEME} > ${MONACO_FILE}"
    echo " "
  fi
done

THEMES_JSON=$(echo "$(echo ${THEMES_JSON} | sed 's/,*$//g')}")
echo "${THEMES_JSON}" >$(echo "${THEMES_DESTINATION}/themes.json")

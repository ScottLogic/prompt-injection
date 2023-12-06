# Export PDF Language Support

To support multiple languages with special characters we need to register fonts and set the fontFamily (example in ExportContent.tsx)
Download font families tts or otf files from https://fonts.google.com/noto to assets/fonts/

Currently can only use a single file at a time, so we can merge multiple using script from https://github.com/notofonts/nototools/blob/main/nototools/merge_fonts.py.

The current CombinedFont.ttf contains:

- NotoSans-Regular.ttf
- NotoSerifDevanagari-Regular.ttf
- NotoKufiArabic-Regular.ttf
- NotoSansThai-Regular.ttf
- NotoSerifBengali_Condensed-Regular.ttf
- NotoSerifGurmukhi-Regular.ttf
- NotoSansHebrew-Regular.ttf

## License

All fonts are licensed under the [Open Font License](./OFL.md).
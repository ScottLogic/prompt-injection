# Export PDF Language Support

To support multiple languages with special characters we need to register fonts and set the font-family -
see [ExportContent.tsx](../../components/ExportChat/ExportContent.tsx). You can download additional font families
(ttf or otf) from https://fonts.google.com/noto and place in src/assets/fonts.

Currently only a single font-family can be used at a time, so multiple fonts can be merged using this script:
https://github.com/notofonts/nototools/blob/main/nototools/merge_fonts.py.

The current CombinedFont.ttf contains:

- NotoSans-Regular.ttf
- NotoKufiArabic-Regular.ttf
- NotoSansHebrew-Regular.ttf
- NotoSansThai-Regular.ttf
- NotoSerifBengali_Condensed-Regular.ttf
- NotoSerifDevanagari-Regular.ttf
- NotoSerifGurmukhi-Regular.ttf

Japanese and Chinese font packs are not included in the CombinedFonts family as they are prohibitively large, so if you are
running the application locally and wish to export chats in either of those fonts, you will need to modify the code in
[ExportContent.tsx](../../components/ExportChat/ExportContent.tsx) accordingly.

## License

All fonts are licensed under the [Open Font License](./OFL.md).

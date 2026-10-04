package com.passpilot.app;
import java.util.regex.Pattern;
final class RecognitionQuality {
 static int score(String text){int words=0;java.util.regex.Matcher m=Pattern.compile("[A-Za-zÄÖÜäöü]{3,}").matcher(text);while(m.find()&&words<25)words++;if(Pattern.compile("\\b(?:model|modell|type|typ|S/?N|serial|serien|rechnungs|invoice)\\b",Pattern.CASE_INSENSITIVE).matcher(text).find())words+=15;if(Pattern.compile("\\d{1,2}[./]\\d{1,2}[./]\\d{2,4}|\\d+[,.]\\d{2}\\s*(?:EUR|€)|\\b(?:summe|gesamt|total)\\b",Pattern.CASE_INSENSITIVE).matcher(text).find())words+=15;return words;}
}

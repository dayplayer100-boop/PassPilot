package com.passpilot.app;
import org.junit.Test;
import static org.junit.Assert.*;
public class ManualFinderTest {
 @Test public void onlyOfficialHostAndModelMatchAreCandidates(){assertNotNull(ManualFinder.candidate("Sony","WH-1000XM5","Hilfe WH-1000XM5","https://helpguide.sony.net/mdr/wh1000xm5/v1/de/print.pdf",""));assertNull(ManualFinder.candidate("Sony","WH-1000XM5","WH-1000XM5","https://sony.com.evil.example/manual.pdf",""));assertNull(ManualFinder.candidate("Sony","WH-1000XM5","WH-1000XM4","https://www.sony.com/manual.pdf",""));assertNull(ManualFinder.candidate("Sony","WH-1000XM5","WH-1000XM5S","https://www.sony.com/manual.pdf",""));assertNull(ManualFinder.candidate("Sony","WH-1000XM5","WH-1000XM5","http://www.sony.com/manual.pdf",""));}
 @Test public void formattingDoesNotConfuseAdjacentModels(){assertTrue(ManualFinder.modelMatch("GSR 18V-55","Bosch GSR-18V-55 Anleitung"));assertFalse(ManualFinder.modelMatch("GSR 18V-55","GSR 18V-550 Anleitung"));assertFalse(ManualFinder.modelMatch("DC 1.5V","Batterie LR44"));}
}

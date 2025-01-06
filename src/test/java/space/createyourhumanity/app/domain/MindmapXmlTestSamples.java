package space.createyourhumanity.app.domain;

import java.util.UUID;

public class MindmapXmlTestSamples {

    public static MindmapXml getMindmapXmlSample1() {
        return new MindmapXml().id("id1").text("text1");
    }

    public static MindmapXml getMindmapXmlSample2() {
        return new MindmapXml().id("id2").text("text2");
    }

    public static MindmapXml getMindmapXmlRandomSampleGenerator() {
        return new MindmapXml().id(UUID.randomUUID().toString()).text(UUID.randomUUID().toString());
    }
}

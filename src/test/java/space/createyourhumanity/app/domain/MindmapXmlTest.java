package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.MindmapXmlTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class MindmapXmlTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MindmapXml.class);
        MindmapXml mindmapXml1 = getMindmapXmlSample1();
        MindmapXml mindmapXml2 = new MindmapXml();
        assertThat(mindmapXml1).isNotEqualTo(mindmapXml2);

        mindmapXml2.setId(mindmapXml1.getId());
        assertThat(mindmapXml1).isEqualTo(mindmapXml2);

        mindmapXml2 = getMindmapXmlSample2();
        assertThat(mindmapXml1).isNotEqualTo(mindmapXml2);
    }
}

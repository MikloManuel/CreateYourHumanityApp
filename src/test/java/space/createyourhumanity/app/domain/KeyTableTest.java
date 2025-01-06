package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.KeyTableTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class KeyTableTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(KeyTable.class);
        KeyTable keyTable1 = getKeyTableSample1();
        KeyTable keyTable2 = new KeyTable();
        assertThat(keyTable1).isNotEqualTo(keyTable2);

        keyTable2.setId(keyTable1.getId());
        assertThat(keyTable1).isEqualTo(keyTable2);

        keyTable2 = getKeyTableSample2();
        assertThat(keyTable1).isNotEqualTo(keyTable2);
    }
}

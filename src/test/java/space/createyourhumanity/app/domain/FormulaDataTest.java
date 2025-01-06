package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.FormulaDataTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class FormulaDataTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FormulaData.class);
        FormulaData formulaData1 = getFormulaDataSample1();
        FormulaData formulaData2 = new FormulaData();
        assertThat(formulaData1).isNotEqualTo(formulaData2);

        formulaData2.setId(formulaData1.getId());
        assertThat(formulaData1).isEqualTo(formulaData2);

        formulaData2 = getFormulaDataSample2();
        assertThat(formulaData1).isNotEqualTo(formulaData2);
    }
}

package space.createyourhumanity.app.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A MindmapXml.
 */
@Document(collection = "mindmap_xml")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "mindmapxml")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MindmapXml implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("text")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String text;

    @Field("modified")
    private ZonedDateTime modified;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public MindmapXml id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return this.text;
    }

    public MindmapXml text(String text) {
        this.setText(text);
        return this;
    }

    public void setText(String text) {
        this.text = text;
    }

    public ZonedDateTime getModified() {
        return this.modified;
    }

    public MindmapXml modified(ZonedDateTime modified) {
        this.setModified(modified);
        return this;
    }

    public void setModified(ZonedDateTime modified) {
        this.modified = modified;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MindmapXml)) {
            return false;
        }
        return getId() != null && getId().equals(((MindmapXml) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MindmapXml{" +
            "id=" + getId() +
            ", text='" + getText() + "'" +
            ", modified='" + getModified() + "'" +
            "}";
    }
}

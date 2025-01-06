package space.createyourhumanity.app.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.createyourhumanity.app.domain.MindmapXml;
import space.createyourhumanity.app.repository.MindmapXmlRepository;
import space.createyourhumanity.app.repository.search.MindmapXmlSearchRepository;
import space.createyourhumanity.app.web.rest.errors.BadRequestAlertException;
import space.createyourhumanity.app.web.rest.errors.ElasticsearchExceptionMapper;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link space.createyourhumanity.app.domain.MindmapXml}.
 */
@RestController
@RequestMapping("/api/mindmap-xmls")
public class MindmapXmlResource {

    private static final Logger log = LoggerFactory.getLogger(MindmapXmlResource.class);

    private static final String ENTITY_NAME = "mindmapXml";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MindmapXmlRepository mindmapXmlRepository;

    private final MindmapXmlSearchRepository mindmapXmlSearchRepository;

    public MindmapXmlResource(MindmapXmlRepository mindmapXmlRepository, MindmapXmlSearchRepository mindmapXmlSearchRepository) {
        this.mindmapXmlRepository = mindmapXmlRepository;
        this.mindmapXmlSearchRepository = mindmapXmlSearchRepository;
    }

    /**
     * {@code POST  /mindmap-xmls} : Create a new mindmapXml.
     *
     * @param mindmapXml the mindmapXml to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new mindmapXml, or with status {@code 400 (Bad Request)} if the mindmapXml has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<MindmapXml> createMindmapXml(@RequestBody MindmapXml mindmapXml) throws URISyntaxException {
        log.debug("REST request to save MindmapXml : {}", mindmapXml);
        if (mindmapXml.getId() != null) {
            throw new BadRequestAlertException("A new mindmapXml cannot already have an ID", ENTITY_NAME, "idexists");
        }
        mindmapXml = mindmapXmlRepository.save(mindmapXml);
        mindmapXmlSearchRepository.index(mindmapXml);
        return ResponseEntity.created(new URI("/api/mindmap-xmls/" + mindmapXml.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, mindmapXml.getId()))
            .body(mindmapXml);
    }

    /**
     * {@code PUT  /mindmap-xmls/:id} : Updates an existing mindmapXml.
     *
     * @param id the id of the mindmapXml to save.
     * @param mindmapXml the mindmapXml to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mindmapXml,
     * or with status {@code 400 (Bad Request)} if the mindmapXml is not valid,
     * or with status {@code 500 (Internal Server Error)} if the mindmapXml couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MindmapXml> updateMindmapXml(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody MindmapXml mindmapXml
    ) throws URISyntaxException {
        log.debug("REST request to update MindmapXml : {}, {}", id, mindmapXml);
        if (mindmapXml.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mindmapXml.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mindmapXmlRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        mindmapXml = mindmapXmlRepository.save(mindmapXml);
        mindmapXmlSearchRepository.index(mindmapXml);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, mindmapXml.getId()))
            .body(mindmapXml);
    }

    /**
     * {@code PATCH  /mindmap-xmls/:id} : Partial updates given fields of an existing mindmapXml, field will ignore if it is null
     *
     * @param id the id of the mindmapXml to save.
     * @param mindmapXml the mindmapXml to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mindmapXml,
     * or with status {@code 400 (Bad Request)} if the mindmapXml is not valid,
     * or with status {@code 404 (Not Found)} if the mindmapXml is not found,
     * or with status {@code 500 (Internal Server Error)} if the mindmapXml couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<MindmapXml> partialUpdateMindmapXml(
        @PathVariable(value = "id", required = false) final String id,
        @RequestBody MindmapXml mindmapXml
    ) throws URISyntaxException {
        log.debug("REST request to partial update MindmapXml partially : {}, {}", id, mindmapXml);
        if (mindmapXml.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mindmapXml.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mindmapXmlRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MindmapXml> result = mindmapXmlRepository
            .findById(mindmapXml.getId())
            .map(existingMindmapXml -> {
                if (mindmapXml.getText() != null) {
                    existingMindmapXml.setText(mindmapXml.getText());
                }
                if (mindmapXml.getModified() != null) {
                    existingMindmapXml.setModified(mindmapXml.getModified());
                }

                return existingMindmapXml;
            })
            .map(mindmapXmlRepository::save)
            .map(savedMindmapXml -> {
                mindmapXmlSearchRepository.index(savedMindmapXml);
                return savedMindmapXml;
            });

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, mindmapXml.getId())
        );
    }

    /**
     * {@code GET  /mindmap-xmls} : get all the mindmapXmls.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of mindmapXmls in body.
     */
    @GetMapping("")
    public List<MindmapXml> getAllMindmapXmls() {
        log.debug("REST request to get all MindmapXmls");
        return mindmapXmlRepository.findAll();
    }

    /**
     * {@code GET  /mindmap-xmls/:id} : get the "id" mindmapXml.
     *
     * @param id the id of the mindmapXml to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the mindmapXml, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MindmapXml> getMindmapXml(@PathVariable("id") String id) {
        log.debug("REST request to get MindmapXml : {}", id);
        Optional<MindmapXml> mindmapXml = mindmapXmlRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(mindmapXml);
    }

    /**
     * {@code DELETE  /mindmap-xmls/:id} : delete the "id" mindmapXml.
     *
     * @param id the id of the mindmapXml to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMindmapXml(@PathVariable("id") String id) {
        log.debug("REST request to delete MindmapXml : {}", id);
        mindmapXmlRepository.deleteById(id);
        mindmapXmlSearchRepository.deleteFromIndexById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code SEARCH  /mindmap-xmls/_search?query=:query} : search for the mindmapXml corresponding
     * to the query.
     *
     * @param query the query of the mindmapXml search.
     * @return the result of the search.
     */
    @GetMapping("/_search")
    public List<MindmapXml> searchMindmapXmls(@RequestParam("query") String query) {
        log.debug("REST request to search MindmapXmls for query {}", query);
        try {
            return StreamSupport.stream(mindmapXmlSearchRepository.search(query).spliterator(), false).toList();
        } catch (RuntimeException e) {
            throw ElasticsearchExceptionMapper.mapException(e);
        }
    }
}

CREATE TABLE golfcourse_technology (
    course_id UUID REFERENCES golfcourse(global_id),
    technology_id UUID REFERENCES technologyintegration(technology_id),
    PRIMARY KEY (course_id, technology_id)
);

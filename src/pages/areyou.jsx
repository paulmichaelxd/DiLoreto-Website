import React from 'react';
import PropTypes from 'prop-types';
import { uid } from 'react-uid';
import Lightbox from 'react-images';
import { StaticQuery, graphql } from 'gatsby';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Metadata from '../components/Layout/Metadata';
import ContactModal from '../components/Home/ContactModal';
import Record from '../components/FamilyHistory/Record';

class FamilyHistoryCore extends React.Component {
  constructor(props) {
    super(props);

    this.allPhotos = props.data.reduce((acc, cur) => {
      // We don't want to add to the photo gallery if its a link thumbnail
      if (cur.link) {
        return acc;
      }
      return [...acc, ...cur.photos || []];
    }, []).filter(photo => photo);

    this.state = {
      contactActive: false,
      imagesActive: false,
      currentPhoto: 0,
    };
  }

  render() {
    const { classes, data, people } = this.props;
    const { contactActive, imagesActive, currentPhoto } = this.state;

    return (
      <React.Fragment>
        <Metadata
          title="Are You a DiLoreto?"
          description="Are you a DiLoreto? View the history of the DiLoretos from Alfadena, Italy to Michigan and California. Extensive historical sources, photos and family tree listed."
        />

        <ContactModal
          open={contactActive}
          onClose={() => this.setState({ contactActive: false })}
          people={people}
        />

        <Lightbox
          images={this.allPhotos.map(photo => ({
            src: photo.fullSize.src,
            srcSet: photo.fullSize.srcSet,
            caption: photo.description,
            alt: photo.title,
          }))}
          isOpen={imagesActive}
          backdropClosesModal
          currentImage={currentPhoto}
          onClickPrev={() => this.setState({ currentPhoto: currentPhoto - 1 })}
          onClickNext={() => this.setState({ currentPhoto: currentPhoto + 1 })}
          onClose={() => this.setState({ imagesActive: false })}
        />

        <div className={classes.info}>
          <Typography variant="subtitle1" align="center" gutterBottom>
          A genealogical record of the DiLoreto lineage is maintained,
          and we would love to hear from any relatives with updates.
          An updated copy of the complete family tree can be sent as a PDF to family members.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => this.setState({ contactActive: true })}
          >
          Contact Us
          </Button>
        </div>

        {data.map((record, index) => (
          <Record
            key={uid(record)}
            data={record}
            isEven={index % 2 === 0}
            openPhoto={id => this.setState({
              imagesActive: true,
              currentPhoto: this.allPhotos.findIndex(photo => (
                photo.id === id
              )),
            })}
          />
        ))}
      </React.Fragment>
    );
  }
}

FamilyHistoryCore.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.object.isRequired,
      link: PropTypes.string,
      photos: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          thumbnail: PropTypes.object.isRequired,
          fullSize: PropTypes.object.isRequired,
        }),
      ),
    }),
  ).isRequired,
  people: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      link: PropTypes.string,
    }),
  ).isRequired,
};

const styles = theme => ({
  info: {
    padding: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const FamilyHistoryWithStyles = withStyles(styles)(FamilyHistoryCore);

export default () => (
  <StaticQuery
    query={graphql`
      query HistoryQuery {
        allContentfulFamilyHistory(sort: {fields: [year], order: ASC}) {
          edges {
            node {
              year
              title
              link
              photos {
                id
                title
                description
                thumbnail: fluid(maxWidth: 600) {
                  ...GatsbyContentfulFluid_withWebp
                }
                fullSize: fluid(maxWidth: 1920) {
                  ...GatsbyContentfulFluid_withWebp
                }
              }
              content {
                childMarkdownRemark {
                  html
                }
              }
            }
          }
        }
        allContentfulPeople(sort: {fields: [order], order: ASC}) {
          edges {
            node {
              order
              firstName
              fullName
              link
              email
            }
          }
        }
      }
    `}
    render={data => (
      <FamilyHistoryWithStyles
        people={data.allContentfulPeople.edges.map(item => (
          item.node
        ))}
        data={data.allContentfulFamilyHistory.edges.map(item => (
          item.node
        ))}
      />
    )}
  />
);
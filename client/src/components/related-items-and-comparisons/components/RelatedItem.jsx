import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from '../../../haxios';
import cardLoader from '../card-loader/cardLoader';
import CompareModal from './CompareModal';
import { FaRegStar } from 'react-icons/fa';
import { Stars } from '../../sharedComponents.jsx';
import utils from '../../../Utils.js';
import PopupRelated from './PopupRelated';

const Container = styled.div`
  display: flex;
  overflow: wrap;
  position: relative;
`;

const Card = styled.div`
  border: 1px solid #dcdcdc;
  display: flex;
  width: 320px;
  height: 300px;
  margin: 10px;
  padding: 0;
  flex-direction: column;
  position: relative;
  cursor: pointer;
`;

const Uppercard = styled.div`
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  z-index: 1000;
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
`;

const ActionButton = styled.button`
  height: 35px;
  width: 35px;
  position: absolute;
  right: 0;
  top: 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Lowercard = styled.div`
  height: 80px;
  background: lightgrey;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 5px;
`;

const Catergory = styled.div`
  font-size: 14px;
`;

const Product = styled.div`
  font-weight: 900;
`;

const Price = styled.div`
  font-size: 13px;
  bottom-padding: 10px;
`;

const ImgWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ReviewWrapper = styled.div`
  padding-top: 1px;
`;

const RelatedItem = ({
  changeCurrentProduct,
  currentProductId,
  relatedItemId,
  currentProduct,
  setSlideIndex,
}) => {
  const [defaultProductStyle, setDefaultProductStyle] = useState(
    [cardLoader.photos[0].thumbnail_url]
  );
  const [defaultProduct, setDefaultProduct] = useState(currentProductId || 38328);
  const [defaultProductFeatures] = useState([]);
  const [compareToProductFeatures] = useState([]);
  const [previewImage, setPreviewImage] = useState(cardLoader.photos[0].thumbnail_url);

  const [hovered, setHovered] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [combinedFeatures, setCombinedFeatures] = useState({});
  const [metadata, setMetadata] = useState({});

  // FETCH API
  const fetchRelatedProduct = () => {
    axios
      .get(`/API/products/${relatedItemId}/`)
      .then((relatedItemInfo) => {
        setDefaultProduct(relatedItemInfo.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchRelatedProductStyles = () => {
    axios
      .get(`/API/products/${relatedItemId}/styles`)
      .then((relatedItemStyles) => {
        setDefaultProductStyle(relatedItemStyles.data.results[0].photos);
        setPreviewImage(relatedItemStyles.data.results[0].photos[0].thumbnail_url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchMetadata = () => {
    axios
      .get(`/API/reviews/meta?product_id=${relatedItemId}`)
      .then((metadataInfo) => {
        setMetadata(utils.parseReviewsMeta(metadataInfo.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchRelatedProduct();
    fetchRelatedProductStyles();
    fetchMetadata();
  }, []);

  const onModalClick = () => {
    setShowCompare((prev) => !prev);
    combineFeatures(currentProduct.features, defaultProduct.features);
  };

  const combineFeatures = (currentProduct, defaultProduct) => {
    let combinedFeaturesObj = {};

    currentProduct.forEach((product) => {
      if (!combinedFeaturesObj[product.feature]) {
        if (product.value === null) {
          combinedFeaturesObj[product.feature] = ['✓'];
        } else {
          combinedFeaturesObj[product.feature] = [product.value];
        }
      }
    });

    defaultProduct.forEach((product) => {
      if (!combinedFeaturesObj[product.feature]) {
        if (product.value === null) {
          combinedFeaturesObj[product.feature] = [undefined, '✓'];
        } else {
          combinedFeaturesObj[product.feature] = [undefined, product.value];
        }
      } else if (product.value === null) {
        combinedFeaturesObj[product.feature][1] = ['✓'];
      } else {
        combinedFeaturesObj[product.feature][1] = [product.value];
      }
    });

    const features = Object.keys(combinedFeaturesObj);
    const values = Object.values(combinedFeaturesObj);

    const comparisonObject = {
      currentProduct: [],
      feature: [],
      comparisonProduct: [],
    };

    for (let i = 0; i < features.length; i++) {
      comparisonObject.currentProduct.push(values[i][0]);
      comparisonObject.feature.push(features[i]);
      comparisonObject.comparisonProduct.push(values[i][1]);
    }
    setCombinedFeatures(comparisonObject);
  };

  const handleHover = () => {
    setHovered(true);
  };

  const handleHoverOut = () => {
    setHovered(false);
  };

  const changePreviewItem = (index) => {
    setPreviewImage(defaultProductStyle[index].thumbnail_url);
  };

  return (
    <>
      <Container>
        <Card>
          <Uppercard>
            <ButtonWrapper>
              <ActionButton onClick={onModalClick}>
                <FaRegStar size={40} />
              </ActionButton>
            </ButtonWrapper>
            <ImgWrapper onMouseEnter={handleHover} onMouseLeave={handleHoverOut}>
              {hovered ? (
                <PopupRelated
                  productStyles={defaultProductStyle}
                  changeCurrentProduct={changeCurrentProduct}
                  defaultProduct={defaultProduct}
                  changePreviewItem={changePreviewItem}
                  previewImage={previewImage}
                />
              ) : null}
              {defaultProductStyle[0].thumbnail_url === null ? (
                <Image src='./img/imageNotAvailable.png' />
              ) : (
                <Image src={previewImage} />
              )}
            </ImgWrapper>
          </Uppercard>
          <Lowercard>
            <Catergory>{defaultProduct.category}</Catergory>
            <Product>{defaultProduct.name}</Product>
            <Price>${defaultProduct.default_price}</Price>
            <ReviewWrapper>
              <Stars reviewsMeta={metadata} />
            </ReviewWrapper>
          </Lowercard>
          <CompareModal
            showCompare={showCompare}
            setShowCompare={setShowCompare}
            combinedFeatures={combinedFeatures}
            currentItem={currentProduct}
            defaultProduct={defaultProduct}
          />
        </Card>
      </Container>
    </>
  );
};

export default RelatedItem;

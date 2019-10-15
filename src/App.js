import React from 'react';
import './App.css';
import "filepond/dist/filepond.min.css";
import Container from 'react-bootstrap/Container';
import { unregister } from './serviceWorker';
import {FilePond,registerPlugin} from "react-filepond";
import Swagger from "swagger-client";
import spec from "./ApiSwaggerSpec";
import dogBreeds from "./DogBreedMap";
import loadingCircle from "./loadingCircle.gif";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImageExifOrientation,FilePondPluginImagePreview);

unregister();
class App extends React.Component{

  constructor(props){
      super(props);
      this.state = {
          image:null,
          prediction:null,
          results:null,
          uploadError:false,
          loading:false
      }
  }

  getDogBreedPrediction = () => {
   const dogBreedMapKey = this.state.prediction;
   if(dogBreeds.hasOwnProperty(dogBreedMapKey)){
      return <p className="result">This looks like a <span className="dogBreed">{dogBreeds[dogBreedMapKey]}</span> !</p>
   }
   else{
       return "The dog breed could not be determined."
   }
  };

  catchError = () => {
      this.setState({
          uploadError:true,
          loading:false
      });
  };

  classifyDogBreed = () => {
      const component = this;
      this.setState({
          loading:true,
          prediction:null,
          results:null
      });
      Swagger({ spec: spec,headers:{"Accept": "application/json"}}).then((client) =>
      {
          client.apis.predictImage.predictImage_create(
              component.state
          ).then(function (result) {
              if(result.ok){
                  console.log("Recieved prediction results");
                  console.log(result.obj);
                  component.setState({
                      loading:false,
                      prediction:result.obj.prediction.toString(),
                      results:result.obj.results,
                      uploadError:false,
                  })
              }
          }).catch(component.catchError)
      }).catch(component.catchError)
  };

  render(){

        return (
            <Container>
                <h3>Dog Breed Classifier</h3>
                <hr/>
                <p>Upload a picture of a dog using the input below to have a neural network guess the dog's breed!</p>
                <p> Information regarding how the model was created can be found on the project's
                   <a href="https://github.com/juliantglover/Dog-Breed-Classification-Deep-Learning-CNN"> GitHub Page</a>.
                </p>
                <div className="inputWrapper">
                    <FilePond
                        allowImageExifOrientation={true}
                        acceptedFileTypes={['image/jpeg']}
                        onupdatefiles={fileItems => {
                            if (fileItems.length > 0){
                                this.setState({
                                    image: fileItems[0].file
                                });
                                this.classifyDogBreed();
                            }
                        }}
                        allowMultiple={false}
                        maxFiles={1}/>
                </div>
                {this.state.loading ? <img className="loadingImage" src={loadingCircle}/> : null}
                {this.state.uploadError ? <p className="error">Image classification failed.
                    Please try again with a valid image uploaded in 'jpg' format.</p> : null}
                {this.state.prediction === null ? null : this.getDogBreedPrediction()}
                 <p>The list of dog breeds supported can be found
                     <a href="https://www.kaggle.com/c/dog-breed-identification/data"> here</a>.
                     The link also contains great images for testing the network.
                 </p>
            </Container>
          );
  }

}
export default App;
